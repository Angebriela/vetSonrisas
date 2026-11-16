-- Procedimientos Almacenados

-- Pasar de Cita Programada a Consulta Activa
CREATE OR REPLACE PROCEDURE sp_iniciar_consulta(
    p_idCita INT,
    p_idEmpleado INT,
    p_motivoConsulta varchar
)
LANGUAGE plpgsql AS $$
BEGIN
    -- Primero actualizar el estado de la cita, de pendiente a otro estado
    UPDATE CITA SET estadoCita = 'Completada' WHERE idCita = p_idCita;
    
    -- crea consulta a partir de la cita
    INSERT INTO CONSULTA (idCita, idEmpleado, motivoConsulta, fechaConsulta, horaConsulta)
    VALUES (p_idCita, p_idEmpleado, p_motivoConsulta, CURRENT_DATE, CURRENT_TIME);
    
    COMMIT; -- se usa como seguro que update e insert se completen correctamente
EXCEPTION WHEN OTHERS THEN -- esto detiene la ejecución normal si algo en un campo no esta correcto
    ROLLBACK; -- Este es como mi ctrl+z para anular cambios
    RAISE; -- Esto para futuro uso con capas ya que tira el error afuera
END;
$$;

-- Ingreso de mercadería
CREATE OR REPLACE PROCEDURE sp_registrar_nuevo_lote(
    p_idMedicamento INT,
    p_codigoLote VARCHAR,
    p_fechaCaducidad DATE,
    p_cantidad INT,
    p_precioCosto NUMERIC
)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO lote (idMedicamento, codigoLote, fechaCaducidad, stockActual, precioCosto)
    VALUES (p_idMedicamento, p_codigoLote, p_fechaCaducidad, p_cantidad, p_precioCosto);
    COMMIT;
END;
$$;

-- Cancelar una cita por inasistencia
CREATE OR REPLACE PROCEDURE sp_cancelar_cita(p_idCita INT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE CITA SET estadoCita = 'Cancelada' WHERE idCita = p_idCita;
    COMMIT;
END;
$$;