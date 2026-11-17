SET client_encoding TO 'UTF8';
SET search_path TO veterinariasonrisas;

-- 1 Inventario por VENTAS
-- Valida ventas, lotes, apto para ventas y stock
CREATE OR REPLACE FUNCTION fn_stock_venta()
RETURNS TRIGGER AS $$
DECLARE
    v_estado  VARCHAR;
    v_interno BOOLEAN;
    v_lote    RECORD;
BEGIN
    -- Devuelve lo que tenía el detalle anterior (UPDATE o DELETE)
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        SELECT estado INTO v_estado FROM venta WHERE idventa = OLD.idventa;
        IF v_estado = 'Anulada' THEN
            IF TG_OP = 'UPDATE' THEN
                RAISE EXCEPTION 'No se puede modificar el detalle de una venta anulada';
            END IF;
            RETURN OLD; -- al anular ya se devolvió el stock: no se devuelve dos veces
        END IF;
        UPDATE lote SET stockactual = stockactual + OLD.cantmedicamento
        WHERE idlote = OLD.idlote;
    END IF;

    -- Validar y descuenta el detalle nuevo
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        SELECT v.estado, c.esinterno INTO v_estado, v_interno
        FROM venta v JOIN cliente c ON c.idcliente = v.idcliente
        WHERE v.idventa = NEW.idventa;

        IF v_estado = 'Anulada' THEN
            RAISE EXCEPTION 'No se pueden agregar productos a una venta anulada';
        END IF;

        SELECT l.codigolote, l.fechacaducidad, l.stockactual, m.nombremed, m.aptoparaventa
        INTO v_lote
        FROM lote l JOIN medicamento m ON m.idmedicamento = l.idmedicamento
        WHERE l.idlote = NEW.idlote
        FOR UPDATE OF l; -- bloquea el lote: dos ventas simultáneas no se pisan

        IF v_lote.fechacaducidad < CURRENT_DATE THEN
            RAISE EXCEPTION 'El lote % de % venció el %',
                v_lote.codigolote, v_lote.nombremed, to_char(v_lote.fechacaducidad, 'DD/MM/YYYY');
        END IF;
        IF NOT v_lote.aptoparaventa AND NOT v_interno THEN
            RAISE EXCEPTION '% no es apto para venta al público', v_lote.nombremed;
        END IF;
        IF v_lote.stockactual < NEW.cantmedicamento THEN
            RAISE EXCEPTION 'Stock insuficiente en lote % (%): disponible %, solicitado %',
                v_lote.codigolote, v_lote.nombremed, v_lote.stockactual, NEW.cantmedicamento;
        END IF;

        UPDATE lote SET stockactual = stockactual - NEW.cantmedicamento
        WHERE idlote = NEW.idlote;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql
SET search_path = veterinariasonrisas, pg_temp;

CREATE TRIGGER trg_stock_venta
AFTER INSERT OR UPDATE OR DELETE ON venta_detalle
FOR EACH ROW EXECUTE FUNCTION fn_stock_venta();

-- 2 Inventario por USO CLÍNICO (vacunas y cirugías)
CREATE OR REPLACE FUNCTION fn_stock_clinico()
RETURNS TRIGGER AS $$
DECLARE
    v_lote RECORD;
BEGIN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        UPDATE lote SET stockactual = stockactual + OLD.cantidad
        WHERE idlote = OLD.idlote;
    END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        SELECT l.codigolote, l.fechacaducidad, l.stockactual, m.nombremed, m.usoclinico
        INTO v_lote
        FROM lote l JOIN medicamento m ON m.idmedicamento = l.idmedicamento
        WHERE l.idlote = NEW.idlote
        FOR UPDATE OF l;

        IF v_lote.fechacaducidad < CURRENT_DATE THEN
            RAISE EXCEPTION 'El lote % de % venció el %',
                v_lote.codigolote, v_lote.nombremed, to_char(v_lote.fechacaducidad, 'DD/MM/YYYY');
        END IF;
        IF NOT v_lote.usoclinico THEN
            RAISE EXCEPTION '% no está habilitado para uso clínico', v_lote.nombremed;
        END IF;
        IF v_lote.stockactual < NEW.cantidad THEN
            RAISE EXCEPTION 'Stock insuficiente en lote % (%): disponible %, solicitado %',
                v_lote.codigolote, v_lote.nombremed, v_lote.stockactual, NEW.cantidad;
        END IF;

        UPDATE lote SET stockactual = stockactual - NEW.cantidad
        WHERE idlote = NEW.idlote;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql
SET search_path = veterinariasonrisas, pg_temp;

CREATE TRIGGER trg_stock_vacuna
AFTER INSERT OR UPDATE OR DELETE ON vacunas_detalle
FOR EACH ROW EXECUTE FUNCTION fn_stock_clinico();

CREATE TRIGGER trg_stock_cirugia
AFTER INSERT OR UPDATE OR DELETE ON cirugias_detalle
FOR EACH ROW EXECUTE FUNCTION fn_stock_clinico();

-- 3 Ingreso de inventario por COMPRAS
CREATE OR REPLACE FUNCTION fn_stock_compra()
RETURNS TRIGGER AS $$
DECLARE
    v_stock INT;
BEGIN
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        SELECT stockactual INTO v_stock FROM lote WHERE idlote = OLD.idlote FOR UPDATE;
        IF v_stock < OLD.cantidad THEN
            RAISE EXCEPTION 'No se puede revertir la compra: ya se usaron unidades de ese lote (quedan %)', v_stock;
        END IF;
        UPDATE lote SET stockactual = stockactual - OLD.cantidad WHERE idlote = OLD.idlote;
    END IF;

    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        UPDATE lote SET stockactual = stockactual + NEW.cantidad WHERE idlote = NEW.idlote;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql
SET search_path = veterinariasonrisas, pg_temp;

CREATE TRIGGER trg_stock_compra
AFTER INSERT OR UPDATE OR DELETE ON compra_detalle
FOR EACH ROW EXECUTE FUNCTION fn_stock_compra();

-- 4 Para agenda: un veterinario no puede tener dos citas traslapadas
CREATE OR REPLACE FUNCTION fn_cita_sin_traslape()
RETURNS TRIGGER AS $$
DECLARE
    v_otra RECORD;
BEGIN
    IF NEW.estadocita = 'Cancelada' THEN
        RETURN NEW; 
    END IF;

    SELECT c.idcita, c.horainicio, c.horafin INTO v_otra
    FROM cita c
    WHERE c.idempleado = NEW.idempleado
      AND c.fechacita  = NEW.fechacita
      AND c.estadocita <> 'Cancelada'
      AND c.idcita     <> COALESCE(NEW.idcita, 0)
      AND c.horainicio < NEW.horafin     
      AND c.horafin    > NEW.horainicio  
    LIMIT 1;

    IF FOUND THEN
        RAISE EXCEPTION 'El empleado ya tiene la cita #% de % a % ese día',
            v_otra.idcita, to_char(v_otra.horainicio, 'HH24:MI'), to_char(v_otra.horafin, 'HH24:MI');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = veterinariasonrisas, pg_temp;

CREATE TRIGGER trg_cita_sin_traslape
BEFORE INSERT OR UPDATE ON cita
FOR EACH ROW EXECUTE FUNCTION fn_cita_sin_traslape();

-- 5 Consulta toma el paciente de la cita y evita incoherencias
CREATE OR REPLACE FUNCTION fn_consulta_paciente()
RETURNS TRIGGER AS $$
DECLARE
    v_paciente INT;
BEGIN
    IF NEW.idcita IS NOT NULL THEN
        SELECT idpaciente INTO v_paciente FROM cita WHERE idcita = NEW.idcita;
        IF NEW.idpaciente IS NULL THEN
            NEW.idpaciente := v_paciente;
        ELSIF NEW.idpaciente <> v_paciente THEN
            RAISE EXCEPTION 'El paciente de la consulta no coincide con el de la cita #%', NEW.idcita;
        END IF;
    END IF;

    IF NEW.idpaciente IS NULL THEN
        RAISE EXCEPTION 'Una consulta sin cita (emergencia) debe indicar el paciente';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = veterinariasonrisas, pg_temp;

CREATE TRIGGER trg_consulta_paciente
BEFORE INSERT OR UPDATE ON consulta
FOR EACH ROW EXECUTE FUNCTION fn_consulta_paciente();

-- 6 Bitácora de auditoría
CREATE OR REPLACE FUNCTION fn_bitacora()
RETURNS TRIGGER AS $$
DECLARE
    v_ant JSONB := CASE WHEN TG_OP <> 'INSERT' THEN to_jsonb(OLD) END;
    v_nue JSONB := CASE WHEN TG_OP <> 'DELETE' THEN to_jsonb(NEW) END;
BEGIN
    INSERT INTO auditoria (tabla, operacion, idregistro, datosanteriores, datosnuevos)
    VALUES (TG_TABLE_NAME, TG_OP,
            (COALESCE(v_nue, v_ant) ->> TG_ARGV[0])::INT,
            v_ant, v_nue);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql
SET search_path = veterinariasonrisas, pg_temp;

CREATE TRIGGER trg_bitacora_venta
AFTER INSERT OR UPDATE OR DELETE ON venta
FOR EACH ROW EXECUTE FUNCTION fn_bitacora('idventa');

CREATE TRIGGER trg_bitacora_lote
AFTER INSERT OR UPDATE OR DELETE ON lote
FOR EACH ROW EXECUTE FUNCTION fn_bitacora('idlote');

CREATE TRIGGER trg_bitacora_cita
AFTER INSERT OR UPDATE OR DELETE ON cita
FOR EACH ROW EXECUTE FUNCTION fn_bitacora('idcita');

CREATE TRIGGER trg_bitacora_medicamento
AFTER INSERT OR UPDATE OR DELETE ON medicamento
FOR EACH ROW EXECUTE FUNCTION fn_bitacora('idmedicamento');
