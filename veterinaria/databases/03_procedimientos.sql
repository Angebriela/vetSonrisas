-- Procedimientos almacenados
SET client_encoding TO 'UTF8';
SET search_path TO veterinariasonrisas;

-- 1 Iniciar consulta a partir de una cita
-- Marca la cita como Atendida y crea la consulta en una sola operación.
CREATE OR REPLACE PROCEDURE sp_iniciar_consulta(
    p_idcita INT,
    p_idempleado INT,
    p_motivoconsulta VARCHAR
)
LANGUAGE plpgsql 
SET search_path = veterinariasonrisas
AS $$
DECLARE
    v_cita RECORD;
BEGIN
    SELECT idpaciente, estadocita INTO v_cita
    FROM cita WHERE idcita = p_idcita
    FOR UPDATE; 

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La cita #% no existe', p_idcita;
    END IF;
    IF v_cita.estadocita NOT IN ('Pendiente', 'Confirmada') THEN
        RAISE EXCEPTION 'La cita #% está % y no se puede atender', p_idcita, v_cita.estadocita;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM empleados WHERE idempleado = p_idempleado) THEN
        RAISE EXCEPTION 'El empleado #% no existe', p_idempleado;
    END IF;
    IF p_motivoconsulta IS NULL OR btrim(p_motivoconsulta) = '' THEN
        RAISE EXCEPTION 'El motivo de la consulta es obligatorio';
    END IF;

    UPDATE cita SET estadocita = 'Atendida' WHERE idcita = p_idcita;

    INSERT INTO consulta (idcita, idpaciente, idempleado, motivoconsulta)
    VALUES (p_idcita, v_cita.idpaciente, p_idempleado, btrim(p_motivoconsulta));
END;
$$;

-- 2 Cancelar una cita
CREATE OR REPLACE PROCEDURE sp_cancelar_cita(p_idcita INT)
LANGUAGE plpgsql 
SET search_path = veterinariasonrisas 
AS $$
DECLARE
    v_estado VARCHAR;
BEGIN
    SELECT estadocita INTO v_estado FROM cita WHERE idcita = p_idcita FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La cita #% no existe', p_idcita;
    END IF;
    IF v_estado = 'Atendida' THEN
        RAISE EXCEPTION 'La cita #% ya fue atendida y no se puede cancelar', p_idcita;
    END IF;
    IF v_estado = 'Cancelada' THEN
        RAISE EXCEPTION 'La cita #% ya estaba cancelada', p_idcita;
    END IF;

    UPDATE cita SET estadocita = 'Cancelada' WHERE idcita = p_idcita;
END;
$$;

-- 3 Ingreso de mercadería registra un lote dentro de una compra
-- Si el lote ya existe, lo reabastece.
CREATE OR REPLACE PROCEDURE sp_registrar_nuevo_lote(
    p_idcompra       INT,
    p_idmedicamento  INT,
    p_codigolote     VARCHAR,
    p_fechacaducidad DATE,
    p_cantidad       INT,
    p_preciocosto    NUMERIC,
    p_precioventa    NUMERIC
)
LANGUAGE plpgsql 
SET search_path = veterinariasonrisas 
AS $$
DECLARE
    v_idlote INT;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM compra WHERE idcompra = p_idcompra) THEN
        RAISE EXCEPTION 'La compra #% no existe', p_idcompra;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM medicamento WHERE idmedicamento = p_idmedicamento) THEN
        RAISE EXCEPTION 'El medicamento #% no existe', p_idmedicamento;
    END IF;
    IF p_cantidad IS NULL OR p_cantidad <= 0 THEN
        RAISE EXCEPTION 'La cantidad debe ser mayor a 0';
    END IF;
    IF p_fechacaducidad <= CURRENT_DATE THEN
        RAISE EXCEPTION 'No se puede ingresar un lote vencido (caduca el %)',
            to_char(p_fechacaducidad, 'DD/MM/YYYY');
    END IF;
    IF p_preciocosto <= 0 OR p_precioventa <= 0 THEN
        RAISE EXCEPTION 'Los precios deben ser mayores a 0';
    END IF;
    IF p_precioventa < p_preciocosto THEN
        RAISE EXCEPTION 'El precio de venta (%) no puede ser menor al costo (%)', p_precioventa, p_preciocosto;
    END IF;

    SELECT idlote INTO v_idlote
    FROM lote
    WHERE idmedicamento = p_idmedicamento AND codigolote = btrim(p_codigolote);

    IF v_idlote IS NULL THEN
        INSERT INTO lote (idmedicamento, codigolote, fechacaducidad, stockactual, preciocosto, precioventa)
        VALUES (p_idmedicamento, btrim(p_codigolote), p_fechacaducidad, 0, p_preciocosto, p_precioventa)
        RETURNING idlote INTO v_idlote;
    ELSE
        UPDATE lote
        SET preciocosto = p_preciocosto, precioventa = p_precioventa
        WHERE idlote = v_idlote;
    END IF;

    INSERT INTO compra_detalle (idcompra, idlote, cantidad, preciocosto)
    VALUES (p_idcompra, v_idlote, p_cantidad, p_preciocosto);
END;
$$;

-- 4 Anular una venta y devolver el stock a sus lotes
-- La factura no se borra queda como historial con estado Anulada.
CREATE OR REPLACE PROCEDURE sp_anular_venta(
    p_idventa INT,
    p_motivo  VARCHAR
)
LANGUAGE plpgsql 
SET search_path = veterinariasonrisas 
AS $$
DECLARE
    v_estado VARCHAR;
BEGIN
    SELECT estado INTO v_estado FROM venta WHERE idventa = p_idventa FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La venta #% no existe', p_idventa;
    END IF;
    IF v_estado = 'Anulada' THEN
        RAISE EXCEPTION 'La venta #% ya estaba anulada', p_idventa;
    END IF;
    IF p_motivo IS NULL OR btrim(p_motivo) = '' THEN
        RAISE EXCEPTION 'Debe indicar el motivo de la anulación';
    END IF;

    -- Devuelve a cada lote la suma de lo vendido en esta factura
    UPDATE lote l
    SET stockactual = l.stockactual + d.total
    FROM (SELECT idlote, SUM(cantmedicamento) AS total
          FROM venta_detalle
          WHERE idventa = p_idventa
          GROUP BY idlote) d
    WHERE l.idlote = d.idlote;

    UPDATE venta
    SET estado = 'Anulada', motivoanulacion = btrim(p_motivo), fechaanulacion = NOW()
    WHERE idventa = p_idventa;
END;
$$;
