-- VETERINARIA SONRISAS usuarios e inicio de sesión
--
-- ORDEN DE EJECUCIÓN: este script va DESPUÉS de 04_datos_prueba.sql.
-- 04 hace TRUNCATE empleados ... CASCADE, y ese CASCADE también vacía la tabla
-- usuario (depende de empleados). Si se vuelve a cargar 04, hay que volver a
-- ejecutar este script para recrear los usuarios de prueba.
--
-- Se puede ejecutar varias veces: no borra nada y no duplica datos.
SET client_encoding TO 'UTF8';
SET search_path TO veterinariasonrisas;

-- Cifrado de contraseñas con bcrypt (crypt + gen_salt('bf')).
-- En Supabase la extensión ya existe en el esquema extensions y esta línea no hace nada.
-- En local se instala en public para que no desaparezca con el DROP SCHEMA de 01_ddl.sql.
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- =====================================================================
-- 1. TABLA
-- =====================================================================
-- El rol NO se guarda en usuario: se obtiene por usuario -> empleados -> rol.
-- El rol depende del empleado, no del usuario; guardarlo aquí sería una
-- dependencia transitiva (rompe 3FN) y dejaría dos fuentes del rol que podrían
-- contradecirse. Cambiar el rol del empleado basta para cambiar sus permisos.
--
-- Sin trigger de bitácora a propósito: copiaría los hashes de las contraseñas
-- a la tabla de auditoría.
CREATE TABLE IF NOT EXISTS usuario (
    idusuario      SERIAL PRIMARY KEY,
    idempleado     INT NOT NULL UNIQUE REFERENCES empleados(idempleado), -- un usuario por empleado
    nombreusuario  VARCHAR(50) NOT NULL UNIQUE,
    contrasenahash VARCHAR(100) NOT NULL,
    activo         BOOLEAN NOT NULL DEFAULT TRUE,
    fechacreacion  TIMESTAMP NOT NULL DEFAULT NOW(),
    ultimoacceso   TIMESTAMP
);

-- =====================================================================
-- 2. PROCEDIMIENTOS Y FUNCIONES
-- =====================================================================
-- Todas llevan public y extensions en el search_path para encontrar crypt y
-- gen_salt tanto en local (public) como en Supabase (extensions).

-- 1 Crear el usuario de un empleado
CREATE OR REPLACE PROCEDURE sp_crear_usuario(
    p_idempleado    INT,
    p_nombreusuario VARCHAR,
    p_contrasena    VARCHAR
)
LANGUAGE plpgsql
SET search_path = veterinariasonrisas, public, extensions
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM empleados WHERE idempleado = p_idempleado) THEN
        RAISE EXCEPTION 'El empleado #% no existe', p_idempleado;
    END IF;
    IF EXISTS (SELECT 1 FROM usuario WHERE idempleado = p_idempleado) THEN
        RAISE EXCEPTION 'El empleado #% ya tiene un usuario', p_idempleado;
    END IF;
    IF p_nombreusuario IS NULL OR btrim(p_nombreusuario) = '' THEN
        RAISE EXCEPTION 'Debe indicar el nombre de usuario';
    END IF;
    IF EXISTS (SELECT 1 FROM usuario WHERE nombreusuario = btrim(p_nombreusuario)) THEN
        RAISE EXCEPTION 'El nombre de usuario "%" ya está en uso', btrim(p_nombreusuario);
    END IF;
    IF p_contrasena IS NULL OR length(p_contrasena) < 8 THEN
        RAISE EXCEPTION 'La contraseña debe tener al menos 8 caracteres';
    END IF;

    INSERT INTO usuario (idempleado, nombreusuario, contrasenahash)
    VALUES (p_idempleado, btrim(p_nombreusuario), crypt(p_contrasena, gen_salt('bf')));
END;
$$;

-- 2 Cambiar la contraseña de un usuario
CREATE OR REPLACE PROCEDURE sp_cambiar_contrasena(
    p_idusuario INT,
    p_nueva     VARCHAR
)
LANGUAGE plpgsql
SET search_path = veterinariasonrisas, public, extensions
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM usuario WHERE idusuario = p_idusuario) THEN
        RAISE EXCEPTION 'El usuario #% no existe', p_idusuario;
    END IF;
    IF p_nueva IS NULL OR length(p_nueva) < 8 THEN
        RAISE EXCEPTION 'La contraseña debe tener al menos 8 caracteres';
    END IF;

    UPDATE usuario
    SET contrasenahash = crypt(p_nueva, gen_salt('bf'))
    WHERE idusuario = p_idusuario;
END;
$$;

-- 3 Validar el inicio de sesión
-- Devuelve una fila solo si el usuario existe, está activo y la contraseña coincide.
-- Si algo falla no devuelve filas, sin decir si fue el usuario o la contraseña.
-- crypt(clave, hash) reutiliza la sal guardada en el hash: si el resultado es igual
-- al hash, la contraseña es correcta. La contraseña nunca se guarda ni se devuelve.
CREATE OR REPLACE FUNCTION fn_validar_login(
    p_nombreusuario VARCHAR,
    p_contrasena    VARCHAR
)
RETURNS TABLE (
    idusuario      INT,
    idempleado     INT,
    nombrecompleto VARCHAR,
    idrol          INT,
    nombrerol      VARCHAR
)
LANGUAGE plpgsql
SET search_path = veterinariasonrisas, public, extensions
AS $$
#variable_conflict use_column
DECLARE
    v_idusuario INT;
BEGIN
    SELECT u.idusuario INTO v_idusuario
    FROM usuario u
    WHERE u.nombreusuario = btrim(p_nombreusuario)
      AND u.activo
      AND u.contrasenahash = crypt(p_contrasena, u.contrasenahash);

    IF NOT FOUND THEN
        RETURN;
    END IF;

    UPDATE usuario u SET ultimoacceso = NOW() WHERE u.idusuario = v_idusuario;

    RETURN QUERY
    SELECT u.idusuario,
           e.idempleado,
           (e.nombreempleado || ' ' || e.apellidoempleado)::VARCHAR,
           r.idrol,
           r.nombrerol
    FROM usuario u
    JOIN empleados e ON e.idempleado = u.idempleado
    JOIN rol r       ON r.idrol = e.idrol
    WHERE u.idusuario = v_idusuario;
END;
$$;

-- =====================================================================
-- 3. DATOS DE PRUEBA: un usuario por empleado (250)
-- =====================================================================
-- Empleados 1 a 8 (uno por rol) con nombres fáciles para la demostración;
-- los demás emp009, emp010... Contraseña de todos: Sonrisas2026!
-- ON CONFLICT DO NOTHING: si el script se vuelve a ejecutar no duplica ni
-- cambia las contraseñas que ya se hayan modificado.
SET search_path TO veterinariasonrisas, public, extensions;

INSERT INTO usuario (idempleado, nombreusuario, contrasenahash)
SELECT e.idempleado,
       CASE e.idempleado
           WHEN 1 THEN 'veterinario'
           WHEN 2 THEN 'asistente'
           WHEN 3 THEN 'recepcion'
           WHEN 4 THEN 'cajero'
           WHEN 5 THEN 'inventario'
           WHEN 6 THEN 'admin'
           WHEN 7 THEN 'groomer'
           WHEN 8 THEN 'conserje'
           ELSE 'emp' || lpad(e.idempleado::text, 3, '0')
       END,
       crypt('Sonrisas2026!', gen_salt('bf'))
FROM empleados e
ORDER BY e.idempleado
ON CONFLICT DO NOTHING;

-- Usuarios inactivos para probar el rechazo: uno de cada 25 empleados después
-- del 8 (emp025, emp050, ..., emp250).
UPDATE usuario SET activo = FALSE
WHERE idempleado > 8 AND idempleado % 25 = 0;

SET search_path TO veterinariasonrisas;

-- =====================================================================
-- 4. COMPROBACIÓN
-- =====================================================================
SELECT count(*)                          AS usuarios,
       count(*) FILTER (WHERE activo)    AS activos,
       count(*) FILTER (WHERE NOT activo) AS inactivos
FROM usuario;
