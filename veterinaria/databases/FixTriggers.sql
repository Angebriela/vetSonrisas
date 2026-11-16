-- Corrección del trigger de inventario.
-- Ejecutar dentro de la base bdveterinariasonrisas.
-- El problema original era que `LOTE` se resolvía fuera del esquema correcto.

CREATE OR REPLACE FUNCTION veterinariasonrisas.fn_descontar_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE veterinariasonrisas.lote
    SET stockactual = stockactual - NEW.cantmedicamento
    WHERE idlote = NEW.idlote;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION veterinariasonrisas.fn_descontar_stock_clinico()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE veterinariasonrisas.lote
    SET stockactual = stockactual - 1
    WHERE idlote = NEW.idlote;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
