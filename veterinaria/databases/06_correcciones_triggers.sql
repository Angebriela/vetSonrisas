-- Aplicar una vez a bases existentes que ya cargaron 02_triggers.sql.
-- Los triggers conservan sus definiciones; solo se fija el esquema que usan
-- sus consultas internas al ejecutarse desde conexiones con search_path=public.
BEGIN;

ALTER FUNCTION veterinariasonrisas.fn_stock_venta()
  SET search_path = veterinariasonrisas, pg_temp;
ALTER FUNCTION veterinariasonrisas.fn_stock_clinico()
  SET search_path = veterinariasonrisas, pg_temp;
ALTER FUNCTION veterinariasonrisas.fn_stock_compra()
  SET search_path = veterinariasonrisas, pg_temp;
ALTER FUNCTION veterinariasonrisas.fn_cita_sin_traslape()
  SET search_path = veterinariasonrisas, pg_temp;
ALTER FUNCTION veterinariasonrisas.fn_consulta_paciente()
  SET search_path = veterinariasonrisas, pg_temp;
ALTER FUNCTION veterinariasonrisas.fn_bitacora()
  SET search_path = veterinariasonrisas, pg_temp;

COMMIT;
