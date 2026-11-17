-- VETERINARIA SONRISAS datos de prueba
SET client_encoding TO 'UTF8';
SET search_path TO veterinariasonrisas;

-- Deja todo vacío y reinicia los contadores 
TRUNCATE TABLE auditoria, venta_detalle, venta, cirugias_detalle, regcirugias,
               vacunas_detalle, regvacunas, consulta, cita, compra_detalle, compra,
               lote, medicamento, anamnesis, paciente, proveedor, cliente,
               empleados, rol, nacionalidad
RESTART IDENTITY CASCADE;
ALTER SEQUENCE seq_factura RESTART WITH 1;

-- =====================================================================
-- 1. CATÁLOGOS
-- =====================================================================
-- 20 países reales + relleno marcado como dato de prueba hasta llegar a 250
INSERT INTO nacionalidad (pais)
SELECT unnest(ARRAY[
    'Guatemala', 'México', 'El Salvador', 'Honduras', 'Nicaragua', 'Costa Rica', 'Panamá',
    'Belice', 'Colombia', 'Venezuela', 'Ecuador', 'Perú', 'Chile', 'Argentina', 'Brasil',
    'Estados Unidos', 'Canadá', 'España', 'Cuba', 'República Dominicana']);

INSERT INTO nacionalidad (pais)
SELECT 'País de prueba ' || lpad(i::text, 3, '0') FROM generate_series(21, 250) AS i;

-- 8 roles reales (ids 1 a 8) + relleno
INSERT INTO rol (nombrerol, detallerol) VALUES
    ('Veterinario',              'Atiende consultas, aplica vacunas y realiza cirugías'),
    ('Asistente veterinario',    'Apoya al veterinario en consultas y procedimientos'),
    ('Recepcionista',            'Agenda citas y registra clientes y pacientes'),
    ('Cajero',                   'Factura las ventas de medicamentos'),
    ('Encargado de inventario',  'Registra compras, lotes y controla vencimientos'),
    ('Administrador',            'Gestiona empleados, catálogos y reportes'),
    ('Groomer',                  'Baño y corte de los pacientes'),
    ('Conserje',                 'Limpieza y mantenimiento de las instalaciones');

INSERT INTO rol (nombrerol, detallerol)
SELECT 'Rol de prueba ' || lpad(i::text, 3, '0'), 'Rol generado solo para cumplir el volumen de datos'
FROM generate_series(9, 250) AS i;

-- =====================================================================
-- 2. PERSONAS
-- =====================================================================
-- 250 empleados. El rol se reparte en ciclo sobre los 8 roles reales:
--   idempleado 1, 9, 17...  -> Veterinario (rol 1)
--   idempleado 4, 12, 20... -> Cajero (rol 4)
--   idempleado 5, 13, 21... -> Encargado de inventario (rol 5)
INSERT INTO empleados (noidentificacion, nombreempleado, apellidoempleado,
                       fechanacimientoempleado, idnacionalidad, idrol)
SELECT
    '2' || lpad((i * 104729)::text, 8, '0') || '0901',
    n.nombres[1 + (i * 7) % 40],
    n.apellidos[1 + (i * 3) % 40] || ' ' || n.apellidos[1 + (i * 11 + 5) % 40],
    DATE '1970-01-15' + (i * 43) % 11000,
    CASE WHEN i % 10 = 0 THEN 1 + (i / 10) % 20 ELSE 1 END,
    1 + (i - 1) % 8
FROM generate_series(1, 250) AS i
CROSS JOIN (SELECT
    ARRAY['María','José','Ana','Luis','Carmen','Carlos','Rosa','Juan','Gabriela','Pedro',
          'Angela','Miguel','Sofía','Diego','Lucía','Jorge','Paola','Fernando','Andrea','Ricardo',
          'Daniela','Mario','Karla','Oscar','Brenda','Edgar','Silvia','Byron','Claudia','Héctor',
          'Evelyn','Marvin','Wendy','Estuardo','Ingrid','Rodrigo','Mónica','Kevin','Alejandra','Sergio'] AS nombres,
    ARRAY['López','García','Pérez','Hernández','Morales','Ramírez','Gómez','Cifuentes','Rodas','De León',
          'Tzul','Sacalxot','Ixcot','Chávez','Barrios','Méndez','Castillo','Velásquez','Ovalle','Racancoj',
          'Escobar','Monzón','Juárez','Reyes','Gramajo','Xicará','Soto','Maldonado','Calderón','Arriola',
          'Mazariegos','Fuentes','Orozco','Coyoy','Rivera','Santizo','Alvarado','Estrada','Quemé','Pacheco'] AS apellidos
) AS n;

-- Cliente #1 = la propia clínica (consumo interno). Es el único con esinterno = TRUE.
INSERT INTO cliente (nit, nombrecliente, apellidocliente, direccion, telefono, correo, esinterno)
VALUES ('CF', 'Veterinaria Sonrisas', 'Uso interno', 'Quetzaltenango', '77610000',
        'clinica@veterinariasonrisas.gt', TRUE);

-- 250 clientes (ids 2 a 251)
INSERT INTO cliente (nit, nombrecliente, apellidocliente, direccion, telefono, correo)
SELECT
    CASE WHEN i % 4 = 0 THEN 'CF' ELSE lpad((i * 7919)::text, 7, '0') || '-' || (i % 10) END,
    nom, ape,
    (1 + i % 15) || 'a. calle ' || (1 + (i * 3) % 30) || '-' || lpad(((i * 7) % 99)::text, 2, '0')
        || ', zona ' || (1 + i % 11) || ', Quetzaltenango',
    (40000000 + i * 13579)::text,
    translate(lower(nom || '.' || split_part(ape, ' ', 1)), 'áéíóúñ ', 'aeioun') || i || '@gmail.com'
FROM (
    SELECT i,
           n.nombres[1 + (i * 11 + 3) % 40] AS nom,
           n.apellidos[1 + (i * 7 + 2) % 40] || ' ' || n.apellidos[1 + (i * 13) % 40] AS ape
    FROM generate_series(1, 250) AS i
    CROSS JOIN (SELECT
        ARRAY['María','José','Ana','Luis','Carmen','Carlos','Rosa','Juan','Gabriela','Pedro',
              'Angela','Miguel','Sofía','Diego','Lucía','Jorge','Paola','Fernando','Andrea','Ricardo',
              'Daniela','Mario','Karla','Oscar','Brenda','Edgar','Silvia','Byron','Claudia','Héctor',
              'Evelyn','Marvin','Wendy','Estuardo','Ingrid','Rodrigo','Mónica','Kevin','Alejandra','Sergio'] AS nombres,
        ARRAY['López','García','Pérez','Hernández','Morales','Ramírez','Gómez','Cifuentes','Rodas','De León',
              'Tzul','Sacalxot','Ixcot','Chávez','Barrios','Méndez','Castillo','Velásquez','Ovalle','Racancoj',
              'Escobar','Monzón','Juárez','Reyes','Gramajo','Xicará','Soto','Maldonado','Calderón','Arriola',
              'Mazariegos','Fuentes','Orozco','Coyoy','Rivera','Santizo','Alvarado','Estrada','Quemé','Pacheco'] AS apellidos
    ) AS n
) AS base;

-- 250 proveedores: 10 tipos de empresa x 25 nombres
INSERT INTO proveedor (nombreproveedor, nit, telefono, correo, direccion)
SELECT
    t.tipos[1 + (i - 1) % 10] || ' ' || t.lugares[1 + ((i - 1) / 10) % 25],
    lpad((i * 6151)::text, 7, '0') || '-' || (i % 10),
    (22000000 + i * 24683)::text,
    'ventas' || i || '@proveedor' || i || '.com.gt',
    (1 + i % 20) || 'a. avenida ' || (1 + (i * 5) % 40) || '-' || lpad(((i * 3) % 99)::text, 2, '0')
        || ', zona ' || (1 + i % 12)
FROM generate_series(1, 250) AS i
CROSS JOIN (SELECT
    ARRAY['Agroveterinaria','Distribuidora','Droguería','Farmacéutica','Laboratorios',
          'Insumos Veterinarios','Importadora','Comercial','Suministros','Bodega Veterinaria'] AS tipos,
    ARRAY['Xela','Occidente','Los Altos','San Marcos','Totonicapán','Huehuetenango','Sololá','Retalhuleu',
          'Mazatenango','Coatepeque','El Quetzal','La Democracia','Minerva','Santa María','Tajumulco',
          'Atitlán','Olintepeque','Salcajá','Cantel','Zunil','Almolonga','La Esperanza','San Mateo',
          'Ostuncalco','Centroamericana'] AS lugares
) AS t;

-- =====================================================================
-- 3. PACIENTES E HISTORIAL
-- =====================================================================
-- 300 pacientes: 60 % caninos, 30 % felinos, 10 % otras especies
INSERT INTO paciente (idcliente, nombrepaciente, especiepaciente, razapaciente, sexopaciente,
                      colorpaciente, fechanacimiento, tipopelaje, identificacionesparticulares, finzootecnico)
SELECT
    2 + (i * 7) % 250,
    a.nombres[1 + (i * 3) % 40],
    e.especie,
    CASE e.especie
        WHEN 'Canino' THEN a.perros[1 + (i * 3) % 12]
        WHEN 'Felino' THEN a.gatos[1 + (i * 3) % 6]
        WHEN 'Conejo' THEN 'Cabeza de león'
        WHEN 'Ave'    THEN 'Periquito australiano'
        WHEN 'Equino' THEN 'Criollo'
        ELSE 'Holstein'
    END,
    CASE WHEN i % 2 = 0 THEN 'M' ELSE 'H' END,
    a.colores[1 + (i * 5) % 8],
    CURRENT_DATE - (200 + (i * 37) % 4000),
    CASE WHEN e.especie = 'Ave' THEN 'Plumaje' ELSE a.pelajes[1 + i % 4] END,
    CASE i % 5
        WHEN 0 THEN 'Mancha blanca en el pecho'
        WHEN 1 THEN 'Sin marcas particulares'
        WHEN 2 THEN 'Cicatriz en la pata trasera izquierda'
        WHEN 3 THEN 'Microchip implantado'
        ELSE 'Oreja derecha caída'
    END,
    CASE e.especie WHEN 'Equino' THEN 'Trabajo' WHEN 'Bovino' THEN 'Producción lechera' ELSE 'Compañía' END
FROM generate_series(1, 300) AS i
CROSS JOIN LATERAL (SELECT CASE
        WHEN i % 10 < 6 THEN 'Canino'
        WHEN i % 10 < 9 THEN 'Felino'
        ELSE (ARRAY['Conejo','Ave','Equino','Bovino'])[1 + (i / 10) % 4]
    END AS especie) AS e
CROSS JOIN (SELECT
    ARRAY['Max','Luna','Rocky','Bella','Toby','Nala','Coco','Kira','Simba','Mía',
          'Bruno','Lola','Zeus','Canela','Thor','Chispa','Rex','Princesa','Duke','Pelusa',
          'Oso','Nieve','Jack','Frida','Tommy','Maya','Lucas','Kiara','Firulais','Manchas',
          'Bobby','Sasha','Rambo','Dulce','Negro','Estrella','Tigre','Muñeca','Capitán','Galleta'] AS nombres,
    ARRAY['Mestizo','Labrador Retriever','Pastor Alemán','Chihuahua','French Poodle','Schnauzer',
          'Bulldog Inglés','Golden Retriever','Husky Siberiano','Pitbull','Shih Tzu','Beagle'] AS perros,
    ARRAY['Doméstico de pelo corto','Siamés','Persa','Angora','Maine Coon','Bengalí'] AS gatos,
    ARRAY['Negro','Blanco','Café','Dorado','Gris','Atigrado','Blanco con negro','Canela'] AS colores,
    ARRAY['Corto','Largo','Rizado','Duro'] AS pelajes
) AS a;

-- 300 fichas de anamnesis (una por paciente)
INSERT INTO anamnesis (idpaciente, fecharegistro, dieta, enfermedadesprevias, cirugiasprevias, esterilizado,
                       nopartos, desparasitada, viajesrecientes, viveconanimales, comportamiento)
SELECT
    p.idpaciente,
    CURRENT_DATE - (30 + (p.idpaciente * 11) % 700),
    (ARRAY['Concentrado seco premium','Concentrado seco y comida húmeda','Comida casera',
           'Dieta BARF','Concentrado medicado renal','Pasto y concentrado'])[1 + p.idpaciente % 6],
    (ARRAY['Ninguna reportada','Parvovirus a los 4 meses','Dermatitis alérgica','Otitis recurrente',
           'Gastroenteritis','Ninguna reportada'])[1 + p.idpaciente % 6],
    CASE WHEN p.idpaciente % 3 = 0 THEN 'Esterilización' ELSE 'Ninguna' END,
    p.idpaciente % 3 = 0,
    CASE WHEN p.sexopaciente = 'H' AND p.idpaciente % 3 <> 0 THEN p.idpaciente % 4 ELSE 0 END,
    p.idpaciente % 5 <> 0,
    p.idpaciente % 9 = 0,
    p.idpaciente % 2 = 0,
    (ARRAY['Tranquilo','Juguetón','Nervioso con extraños','Agresivo al manipularlo','Tímido'])[1 + p.idpaciente % 5]
FROM paciente p;

-- =====================================================================
-- 4. INVENTARIO
-- =====================================================================
-- 250 medicamentos = 25 principios activos x 10 marcas (marcas ficticias)
INSERT INTO medicamento (nombremed, contenidoneto, tipomedicamento, viaadministracion,
                         presentacion, aptoparaventa, usoclinico)
SELECT
    b.nombre || ' ' || (ARRAY['Vetalfa','Zoomed','Agrocan','Canifar','Biopet',
                              'Quetzalvet','Petlab','Farmazoo','Vetsur','Animalia'])[v],
    CASE b.presentacion
        WHEN 'Tableta'    THEN 'Caja x ' || (10 * (1 + v % 3)) || ' tabletas'
        WHEN 'Cápsula'    THEN 'Caja x ' || (10 * (1 + v % 3)) || ' cápsulas'
        WHEN 'Ampolla'    THEN (ARRAY['1 ml','2 ml','5 ml'])[1 + v % 3]
        WHEN 'Pipeta'     THEN (ARRAY['0.67 ml','1.34 ml','2.68 ml'])[1 + v % 3]
        ELSE (ARRAY['10 ml','20 ml','50 ml','100 ml','250 ml'])[1 + v % 5]
    END,
    b.tipo, b.via, b.presentacion, b.venta, b.clinico
FROM (VALUES
    ( 1, 'Amoxicilina',            'Antibiótico',      'Oral',       'Tableta',    TRUE,  TRUE),
    ( 2, 'Enrofloxacina',          'Antibiótico',      'Inyectable', 'Frasco',     FALSE, TRUE),
    ( 3, 'Cefalexina',             'Antibiótico',      'Oral',       'Cápsula',    TRUE,  TRUE),
    ( 4, 'Oxitetraciclina',        'Antibiótico',      'Inyectable', 'Frasco',     FALSE, TRUE),
    ( 5, 'Ivermectina',            'Antiparasitario',  'Inyectable', 'Frasco',     FALSE, TRUE),
    ( 6, 'Fenbendazol',            'Antiparasitario',  'Oral',       'Suspensión', TRUE,  TRUE),
    ( 7, 'Praziquantel',           'Antiparasitario',  'Oral',       'Tableta',    TRUE,  TRUE),
    ( 8, 'Fipronil',               'Antiparasitario',  'Tópica',     'Pipeta',     TRUE,  FALSE),
    ( 9, 'Meloxicam',              'Antiinflamatorio', 'Oral',       'Suspensión', TRUE,  TRUE),
    (10, 'Carprofeno',             'Antiinflamatorio', 'Oral',       'Tableta',    TRUE,  TRUE),
    (11, 'Dexametasona',           'Antiinflamatorio', 'Inyectable', 'Frasco',     FALSE, TRUE),
    (12, 'Prednisolona',           'Antiinflamatorio', 'Oral',       'Tableta',    TRUE,  TRUE),
    (13, 'Tramadol',               'Analgésico',       'Inyectable', 'Ampolla',    FALSE, TRUE),
    (14, 'Dipirona',               'Analgésico',       'Inyectable', 'Frasco',     FALSE, TRUE),
    (15, 'Ketamina',               'Anestésico',       'Inyectable', 'Frasco',     FALSE, TRUE),
    (16, 'Xilacina',               'Anestésico',       'Inyectable', 'Frasco',     FALSE, TRUE),
    (17, 'Propofol',               'Anestésico',       'Inyectable', 'Ampolla',    FALSE, TRUE),
    (18, 'Lidocaína',              'Anestésico',       'Inyectable', 'Frasco',     FALSE, TRUE),
    (19, 'Vacuna antirrábica',     'Vacuna',           'Inyectable', 'Ampolla',    FALSE, TRUE),
    (20, 'Vacuna séxtuple canina', 'Vacuna',           'Inyectable', 'Ampolla',    FALSE, TRUE),
    (21, 'Vacuna triple felina',   'Vacuna',           'Inyectable', 'Ampolla',    FALSE, TRUE),
    (22, 'Vacuna parvovirus',      'Vacuna',           'Inyectable', 'Ampolla',    FALSE, TRUE),
    (23, 'Complejo B',             'Vitamina',         'Inyectable', 'Frasco',     TRUE,  TRUE),
    (24, 'Clorhexidina',           'Antiséptico',      'Tópica',     'Solución',   TRUE,  TRUE),
    (25, 'Gentamicina oftálmica',  'Antibiótico',      'Oftálmica',  'Solución',   TRUE,  TRUE)
) AS b(orden, nombre, tipo, via, presentacion, venta, clinico)
CROSS JOIN generate_series(1, 10) AS v
ORDER BY b.orden, v;

-- 250 compras (las hace un Encargado de inventario: ids 5, 13, 21...)
INSERT INTO compra (idproveedor, idempleado, fechacompra, nofacturaproveedor)
SELECT i, 5 + 8 * ((i - 1) % 31), CURRENT_DATE - (400 - i), 'PROV-' || lpad((i * 37)::text, 6, '0')
FROM generate_series(1, 250) AS i;

-- 300 lotes con stock 0. Vencimientos: 10 % ya vencidos, 10 % por vencer, 80 % vigentes
INSERT INTO lote (idmedicamento, codigolote, fechacaducidad, stockactual, preciocosto, precioventa)
SELECT
    1 + (j - 1) % 250,
    'L' || to_char(CURRENT_DATE, 'YY') || '-' || lpad(j::text, 4, '0'),
    CASE WHEN j % 10 = 0 THEN CURRENT_DATE - (5 + j % 90)
         WHEN j % 10 = 5 THEN CURRENT_DATE + (3 + j % 25)
         ELSE CURRENT_DATE + 200 + (j * 3) % 500
    END,
    0,
    15 + (j * 7) % 180,
    round((15 + (j * 7) % 180) * 1.35, 2)
FROM generate_series(1, 300) AS j;

-- 300 detalles de compra -> el trigger trg_stock_compra carga el stock de cada lote
INSERT INTO compra_detalle (idcompra, idlote, cantidad, preciocosto)
SELECT 1 + (l.idlote - 1) % 250, l.idlote, 150 + (l.idlote % 6) * 25, l.preciocosto
FROM lote l
ORDER BY l.idlote;

-- =====================================================================
-- 5. CITAS Y CONSULTAS
-- =====================================================================
-- 400 citas: 4 por día (08:00, 10:00, 12:00, 14:00) desde hace 85 días hasta dentro de 14.
-- Como cada día tiene horas distintas, nunca chocan con el trigger de traslape.
INSERT INTO cita (idpaciente, idempleado, asuntocita, fechacita, horainicio, horafin, estadocita)
SELECT
    1 + (i * 13) % 300,
    1 + 8 * ((i * 5) % 31),                                  -- un Veterinario
    (ARRAY['Vacunación anual','Control general','Desparasitación','Revisión de piel',
           'Control postoperatorio','Limpieza dental','Cojera','Vómitos y diarrea'])[1 + i % 8],
    f.fecha,
    TIME '08:00' + ((i - 1) % 4) * INTERVAL '2 hours',
    TIME '09:00' + ((i - 1) % 4) * INTERVAL '2 hours',
    CASE WHEN f.fecha < CURRENT_DATE THEN CASE WHEN i % 9 = 0 THEN 'Cancelada' ELSE 'Atendida' END
         ELSE CASE WHEN i % 2 = 0 THEN 'Confirmada' ELSE 'Pendiente' END
    END
FROM generate_series(1, 400) AS i
CROSS JOIN LATERAL (SELECT CURRENT_DATE - 85 + (i - 1) / 4 AS fecha) AS f;

-- Una consulta por cada cita atendida. No se envía idpaciente:
-- lo completa el trigger trg_consulta_paciente a partir de la cita.
INSERT INTO consulta (idcita, idempleado, motivoconsulta, fechaconsulta, horaconsulta,
                      peso, temperatura, diagnostico, tratamiento)
SELECT
    c.idcita, c.idempleado, c.asuntocita, c.fechacita, c.horainicio,
    CASE p.especiepaciente
        WHEN 'Canino' THEN 3 + (c.idcita * 7) % 38 + 0.5
        WHEN 'Felino' THEN 2 + (c.idcita * 3) % 5 + 0.3
        WHEN 'Equino' THEN 350 + (c.idcita * 11) % 150
        WHEN 'Bovino' THEN 400 + (c.idcita * 13) % 200
        ELSE 0.5 + (c.idcita % 4) * 0.4
    END,
    37.5 + (c.idcita % 20) / 10.0,
    d.diag[1 + c.idcita % 8],
    d.trat[1 + c.idcita % 8]
FROM cita c
JOIN paciente p ON p.idpaciente = c.idpaciente
CROSS JOIN (SELECT
    ARRAY['Paciente sano','Dermatitis alérgica','Gastroenteritis leve','Otitis externa',
          'Parasitosis intestinal','Enfermedad periodontal','Esguince leve','Evolución favorable'] AS diag,
    ARRAY['Ninguno; control en 12 meses','Antiinflamatorio oral 5 días y baño medicado',
          'Dieta blanda e hidratación oral','Limpieza de oídos y gotas óticas 7 días',
          'Desparasitante oral, repetir en 15 días','Limpieza dental programada',
          'Reposo y antiinflamatorio 3 días','Continuar tratamiento indicado'] AS trat
) AS d
WHERE c.estadocita = 'Atendida'
ORDER BY c.idcita;

-- 30 emergencias sin cita: aquí sí es obligatorio indicar el paciente
INSERT INTO consulta (idcita, idpaciente, idempleado, motivoconsulta, fechaconsulta, horaconsulta,
                      peso, temperatura, diagnostico, tratamiento)
SELECT
    NULL,
    1 + (i * 17) % 300,
    1 + 8 * ((i * 7) % 31),
    (ARRAY['Atropellamiento','Intoxicación','Dificultad para respirar','Herida por pelea','Convulsiones'])[1 + i % 5],
    CURRENT_DATE - (i * 3) % 85,
    TIME '18:30' + (i % 6) * INTERVAL '30 minutes',
    4 + (i * 5) % 30,
    38.0 + (i % 25) / 10.0,
    (ARRAY['Politraumatismo','Intoxicación por rodenticida','Edema pulmonar','Laceración profunda','Epilepsia idiopática'])[1 + i % 5],
    'Estabilización, fluidoterapia y observación 24 horas'
FROM generate_series(1, 30) AS i;

-- =====================================================================
-- 6. USO CLÍNICO (dispara trg_stock_vacuna y trg_stock_cirugia)
-- =====================================================================
INSERT INTO regvacunas (idpaciente, fechaapertura)
SELECT idpaciente, CURRENT_DATE - (400 + idpaciente % 300) FROM paciente ORDER BY idpaciente;

-- 350 vacunas aplicadas, solo con lotes vigentes de tipo Vacuna
WITH lotes AS (
    SELECT array_agg(l.idlote ORDER BY l.idlote) AS ids
    FROM lote l JOIN medicamento m ON m.idmedicamento = l.idmedicamento
    WHERE m.tipomedicamento = 'Vacuna' AND l.fechacaducidad >= CURRENT_DATE
)
INSERT INTO vacunas_detalle (idregvacunas, idlote, idempleado, cantidad, dosis,
                             fechaadministrada, proximadosis, motivo)
SELECT
    1 + (k * 7) % 300,
    lotes.ids[1 + k % array_length(lotes.ids, 1)],
    1 + 8 * ((k * 3) % 31),
    1,
    '1 ml',
    CURRENT_DATE - (k * 3) % 360,
    CURRENT_DATE - (k * 3) % 360 + 365,
    (ARRAY['Esquema anual','Primera dosis de cachorro','Refuerzo','Requisito de viaje'])[1 + k % 4]
FROM generate_series(1, 350) AS k, lotes;

INSERT INTO regcirugias (idpaciente, fechaapertura)
SELECT idpaciente, CURRENT_DATE - (400 + idpaciente % 300) FROM paciente ORDER BY idpaciente;

-- 300 cirugías, con lotes vigentes de anestésicos y analgésicos
WITH lotes AS (
    SELECT array_agg(l.idlote ORDER BY l.idlote) AS ids
    FROM lote l JOIN medicamento m ON m.idmedicamento = l.idmedicamento
    WHERE m.tipomedicamento IN ('Anestésico', 'Analgésico')
      AND m.usoclinico AND l.fechacaducidad >= CURRENT_DATE
)
INSERT INTO cirugias_detalle (idregcirugia, idlote, idempleado, cantidad, tipodecirugia,
                              nombrecirugia, fechacirugia, motivo)
SELECT
    1 + (k * 11) % 300,
    lotes.ids[1 + k % array_length(lotes.ids, 1)],
    1 + 8 * ((k * 5) % 31),
    1 + k % 2,
    c.tipo, c.nombre,
    CURRENT_DATE - (k * 2) % 360,
    c.motivo
FROM generate_series(1, 300) AS k
CROSS JOIN lotes
CROSS JOIN LATERAL (SELECT * FROM (VALUES
    (0, 'Tejidos blandos', 'Ovariohisterectomía',           'Esterilización electiva'),
    (1, 'Tejidos blandos', 'Orquiectomía',                  'Castración electiva'),
    (2, 'Odontológica',    'Extracción dental',             'Enfermedad periodontal avanzada'),
    (3, 'Tejidos blandos', 'Sutura de herida',              'Laceración por pelea'),
    (4, 'Ortopédica',      'Osteosíntesis de fémur',        'Fractura por atropellamiento'),
    (5, 'Tejidos blandos', 'Cesárea',                       'Parto distócico'),
    (6, 'Oncológica',      'Extirpación de tumor cutáneo',  'Masa en crecimiento'),
    (7, 'Oftalmológica',   'Enucleación',                   'Traumatismo ocular severo')
) AS x(n, tipo, nombre, motivo) WHERE x.n = k % 8) AS c;

-- =====================================================================
-- 7. VENTAS (dispara trg_stock_venta)
-- =====================================================================
-- 300 ventas en los últimos 180 días. El número de factura lo genera la secuencia.
-- 1 de cada 15 es consumo interno de la clínica (cliente #1).
INSERT INTO venta (idcliente, idempleado, fechaventa, horaventa)
SELECT
    CASE WHEN i % 15 = 0 THEN 1 ELSE 2 + (i * 17) % 250 END,
    4 + 8 * ((i * 3) % 31),                                  -- un Cajero
    CURRENT_DATE - (i * 7) % 180,
    TIME '08:30' + ((i * 5) % 18) * INTERVAL '30 minutes'
FROM generate_series(1, 300) AS i;

-- 750 detalles: 2 o 3 productos por venta, solo lotes vigentes y aptos para venta.
-- El precio se copia del lote: queda guardado el precio del momento de la venta.
WITH lotes AS (
    SELECT array_agg(l.idlote ORDER BY l.idlote) AS ids
    FROM lote l JOIN medicamento m ON m.idmedicamento = l.idmedicamento
    WHERE m.aptoparaventa AND l.fechacaducidad >= CURRENT_DATE
)
INSERT INTO venta_detalle (idventa, idlote, cantmedicamento, precioventa)
SELECT v.idventa, l.idlote, 1 + (v.idventa + n) % 3, l.precioventa
FROM venta v
CROSS JOIN lotes
CROSS JOIN generate_series(1, 3) AS n
JOIN lote l ON l.idlote = lotes.ids[1 + (v.idventa * 5 + n * 37) % array_length(lotes.ids, 1)]
WHERE n <= 2 + (v.idventa + 1) % 2
ORDER BY v.idventa, n;

-- 12 facturas anuladas con el procedimiento (devuelve el stock a los lotes)
DO $$
BEGIN
    FOR i IN 1..12 LOOP
        CALL veterinariasonrisas.sp_anular_venta(
            i * 25,
            (ARRAY['Error en el NIT del cliente','Cliente devolvió el producto','Factura duplicada'])[1 + i % 3]);
    END LOOP;
END;
$$;

-- =====================================================================
-- 8. COMPROBACIÓN: filas por tabla (todas deben ser >= 250)
-- =====================================================================
SELECT t.tabla, t.filas, CASE WHEN t.filas >= 250 THEN 'OK' ELSE 'FALTAN' END AS estado
FROM (
              SELECT 'nacionalidad' AS tabla, count(*) AS filas FROM nacionalidad
    UNION ALL SELECT 'rol',              count(*) FROM rol
    UNION ALL SELECT 'empleados',        count(*) FROM empleados
    UNION ALL SELECT 'cliente',          count(*) FROM cliente
    UNION ALL SELECT 'proveedor',        count(*) FROM proveedor
    UNION ALL SELECT 'paciente',         count(*) FROM paciente
    UNION ALL SELECT 'anamnesis',        count(*) FROM anamnesis
    UNION ALL SELECT 'medicamento',      count(*) FROM medicamento
    UNION ALL SELECT 'lote',             count(*) FROM lote
    UNION ALL SELECT 'compra',           count(*) FROM compra
    UNION ALL SELECT 'compra_detalle',   count(*) FROM compra_detalle
    UNION ALL SELECT 'cita',             count(*) FROM cita
    UNION ALL SELECT 'consulta',         count(*) FROM consulta
    UNION ALL SELECT 'regvacunas',       count(*) FROM regvacunas
    UNION ALL SELECT 'vacunas_detalle',  count(*) FROM vacunas_detalle
    UNION ALL SELECT 'regcirugias',      count(*) FROM regcirugias
    UNION ALL SELECT 'cirugias_detalle', count(*) FROM cirugias_detalle
    UNION ALL SELECT 'venta',            count(*) FROM venta
    UNION ALL SELECT 'venta_detalle',    count(*) FROM venta_detalle
) AS t
ORDER BY t.tabla;
