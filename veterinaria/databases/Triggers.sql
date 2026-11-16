--Triggers

-- Función genérica para descontar inventario
CREATE OR REPLACE FUNCTION veterinariasonrisas.fn_descontar_stock() RETURNS TRIGGER AS $$
BEGIN
    UPDATE veterinariasonrisas.lote
    SET stockActual = stockActual - NEW.cantMedicamento -- Para ventas
    WHERE idLote = NEW.idLote;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION veterinariasonrisas.fn_descontar_stock_clinico() RETURNS TRIGGER AS $$
BEGIN
    -- Un uso clínico descuenta 1 unidad también
    UPDATE veterinariasonrisas.lote
    SET stockActual = stockActual - 1
    WHERE idLote = NEW.idLote;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ventas
CREATE TRIGGER trg_descontar_venta
AFTER INSERT ON VENTA_DETALLE
FOR EACH ROW EXECUTE FUNCTION fn_descontar_stock();

-- Vacunas
CREATE TRIGGER trg_descontar_vacuna
AFTER INSERT ON VACUNAS_DETALLE
FOR EACH ROW EXECUTE FUNCTION fn_descontar_stock_clinico();

--Cirugías
CREATE TRIGGER trg_descontar_cirugia
AFTER INSERT ON CIRUGIAS_DETALLE
FOR EACH ROW EXECUTE FUNCTION fn_descontar_stock_clinico();
