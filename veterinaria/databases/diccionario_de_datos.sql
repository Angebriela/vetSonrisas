-- Genera el diccionario de datos (tabla, columna, tipo, restricciones) para el documento técnico.
-- Ejecútalo en DBeaver y exporta el resultado a Excel.
SELECT c.table_name  AS tabla,
       c.column_name AS columna,
       CASE WHEN c.data_type = 'character varying' THEN 'VARCHAR' || COALESCE('(' || c.character_maximum_length || ')', '')
            WHEN c.data_type = 'character'         THEN 'CHAR(' || c.character_maximum_length || ')'
            WHEN c.data_type = 'numeric'           THEN 'NUMERIC(' || c.numeric_precision || ',' || c.numeric_scale || ')'
            WHEN c.data_type LIKE 'timestamp%'     THEN 'TIMESTAMP'
            WHEN c.data_type LIKE 'time %'         THEN 'TIME'
            ELSE upper(c.data_type) END AS tipo,
       CASE WHEN c.is_nullable = 'NO' THEN 'NOT NULL' ELSE '' END AS obligatorio,
       COALESCE((SELECT string_agg(DISTINCT
                    CASE k.contype WHEN 'p' THEN 'PK'
                                   WHEN 'u' THEN 'UNIQUE'
                                   WHEN 'f' THEN 'FK -> ' || k.confrelid::regclass::text
                                   WHEN 'c' THEN 'CHECK' END, ', ')
                 FROM pg_constraint k
                 JOIN pg_attribute a ON a.attrelid = k.conrelid AND a.attnum = ANY (k.conkey)
                 WHERE k.conrelid = (c.table_schema || '.' || c.table_name)::regclass
                   AND a.attname = c.column_name), '') AS restricciones,
       COALESCE(c.column_default, '') AS valor_por_defecto
FROM information_schema.columns c
WHERE c.table_schema = 'veterinariasonrisas'
ORDER BY c.table_name, c.ordinal_position;
