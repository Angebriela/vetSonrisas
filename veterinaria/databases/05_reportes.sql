-- 15 reportes
SET client_encoding TO 'UTF8';
SET search_path TO veterinariasonrisas;

-- 1. Ventas por día
CREATE OR REPLACE FUNCTION rep_ventas_por_dia(p_desde DATE, p_hasta DATE, p_estado TEXT)
RETURNS TABLE ("Fecha" TEXT, "Facturas" INT, "Unidades" INT, "Total (Q)" FLOAT8)
LANGUAGE sql STABLE SET search_path = veterinariasonrisas AS $$
    SELECT to_char(v.fechaventa, 'YYYY-MM-DD'),
           count(DISTINCT v.idventa)::INT,
           COALESCE(sum(d.cantmedicamento), 0)::INT,
           COALESCE(round(sum(d.cantmedicamento * d.precioventa), 2), 0)::FLOAT8
    FROM venta v
    LEFT JOIN venta_detalle d ON d.idventa = v.idventa
    WHERE (p_desde  IS NULL OR v.fechaventa >= p_desde)
      AND (p_hasta  IS NULL OR v.fechaventa <= p_hasta)
      AND v.estado = COALESCE(p_estado, 'Emitida')
    GROUP BY v.fechaventa
    ORDER BY v.fechaventa DESC;
$$;

-- 2. Ventas por empleado 
CREATE OR REPLACE FUNCTION rep_ventas_por_empleado(p_desde DATE, p_hasta DATE)
RETURNS TABLE ("Empleado" TEXT, "Rol" TEXT, "Facturas" INT, "Unidades" INT, "Total (Q)" FLOAT8)
LANGUAGE sql STABLE SET search_path = veterinariasonrisas AS $$
    SELECT e.nombreempleado || ' ' || e.apellidoempleado,
           r.nombrerol::TEXT,
           count(DISTINCT v.idventa)::INT,
           sum(d.cantmedicamento)::INT,
           round(sum(d.cantmedicamento * d.precioventa), 2)::FLOAT8
    FROM venta v
    JOIN venta_detalle d ON d.idventa = v.idventa
    JOIN empleados e ON e.idempleado = v.idempleado
    JOIN rol r ON r.idrol = e.idrol
    WHERE v.estado = 'Emitida'
      AND (p_desde IS NULL OR v.fechaventa >= p_desde)
      AND (p_hasta IS NULL OR v.fechaventa <= p_hasta)
    GROUP BY e.idempleado, e.nombreempleado, e.apellidoempleado, r.nombrerol
    ORDER BY 5 DESC;
$$;

-- 3. Medicamentos más vendidos 
CREATE OR REPLACE FUNCTION rep_medicamentos_mas_vendidos(p_desde DATE, p_hasta DATE, p_tipo TEXT)
RETURNS TABLE ("Medicamento" TEXT, "Tipo" TEXT, "Presentación" TEXT, "Unidades" INT, "Total (Q)" FLOAT8)
LANGUAGE sql STABLE SET search_path = veterinariasonrisas AS $$
    SELECT m.nombremed::TEXT, m.tipomedicamento::TEXT, m.presentacion::TEXT,
           sum(d.cantmedicamento)::INT,
           round(sum(d.cantmedicamento * d.precioventa), 2)::FLOAT8
    FROM venta_detalle d
    JOIN venta v ON v.idventa = d.idventa
    JOIN lote l ON l.idlote = d.idlote
    JOIN medicamento m ON m.idmedicamento = l.idmedicamento
    WHERE v.estado = 'Emitida'
      AND (p_desde IS NULL OR v.fechaventa >= p_desde)
      AND (p_hasta IS NULL OR v.fechaventa <= p_hasta)
      AND (p_tipo  IS NULL OR m.tipomedicamento = p_tipo)
    GROUP BY m.idmedicamento, m.nombremed, m.tipomedicamento, m.presentacion
    ORDER BY 4 DESC, 1;
$$;

-- 4. Facturas anuladas 
CREATE OR REPLACE FUNCTION rep_ventas_anuladas(p_desde DATE, p_hasta DATE)
RETURNS TABLE ("Factura" TEXT, "Fecha" TEXT, "Cliente" TEXT, "Empleado" TEXT,
               "Motivo" TEXT, "Anulada el" TEXT, "Total (Q)" FLOAT8)
LANGUAGE sql STABLE SET search_path = veterinariasonrisas AS $$
    SELECT v.nofactura::TEXT,
           to_char(v.fechaventa, 'YYYY-MM-DD'),
           c.nombrecliente || ' ' || c.apellidocliente,
           e.nombreempleado || ' ' || e.apellidoempleado,
           v.motivoanulacion::TEXT,
           to_char(v.fechaanulacion, 'YYYY-MM-DD HH24:MI'),
           COALESCE((SELECT round(sum(d.cantmedicamento * d.precioventa), 2)
                     FROM venta_detalle d WHERE d.idventa = v.idventa), 0)::FLOAT8
    FROM venta v
    JOIN cliente c ON c.idcliente = v.idcliente
    JOIN empleados e ON e.idempleado = v.idempleado
    WHERE v.estado = 'Anulada'
      AND (p_desde IS NULL OR v.fechaventa >= p_desde)
      AND (p_hasta IS NULL OR v.fechaventa <= p_hasta)
    ORDER BY v.fechaventa DESC, v.nofactura;
$$;

-- 5. Consumo interno de la clínica 
CREATE OR REPLACE FUNCTION rep_consumo_interno(p_desde DATE, p_hasta DATE)
RETURNS TABLE ("Fecha" TEXT, "Factura" TEXT, "Medicamento" TEXT, "Lote" TEXT,
               "Cantidad" INT, "Costo (Q)" FLOAT8)
LANGUAGE sql STABLE SET search_path = veterinariasonrisas AS $$
    SELECT to_char(v.fechaventa, 'YYYY-MM-DD'), v.nofactura::TEXT, m.nombremed::TEXT, l.codigolote::TEXT,
           d.cantmedicamento,
           round(d.cantmedicamento * l.preciocosto, 2)::FLOAT8
    FROM venta v
    JOIN cliente c ON c.idcliente = v.idcliente
    JOIN venta_detalle d ON d.idventa = v.idventa
    JOIN lote l ON l.idlote = d.idlote
    JOIN medicamento m ON m.idmedicamento = l.idmedicamento
    WHERE c.esinterno AND v.estado = 'Emitida'
      AND (p_desde IS NULL OR v.fechaventa >= p_desde)
      AND (p_hasta IS NULL OR v.fechaventa <= p_hasta)
    ORDER BY v.fechaventa DESC, v.nofactura;
$$;

-- 6. Existencias y valor del inventario 
CREATE OR REPLACE FUNCTION rep_existencias(p_tipo TEXT)
RETURNS TABLE ("Medicamento" TEXT, "Tipo" TEXT, "Presentación" TEXT, "Lotes vigentes" INT,
               "Existencia" INT, "Valor a costo (Q)" FLOAT8, "Valor a venta (Q)" FLOAT8)
LANGUAGE sql STABLE SET search_path = veterinariasonrisas AS $$
    SELECT m.nombremed::TEXT, m.tipomedicamento::TEXT, m.presentacion::TEXT,
           count(l.idlote)::INT,
           COALESCE(sum(l.stockactual), 0)::INT,
           COALESCE(round(sum(l.stockactual * l.preciocosto), 2), 0)::FLOAT8,
           COALESCE(round(sum(l.stockactual * l.precioventa), 2), 0)::FLOAT8
    FROM medicamento m
    LEFT JOIN lote l ON l.idmedicamento = m.idmedicamento AND l.fechacaducidad >= CURRENT_DATE
    WHERE (p_tipo IS NULL OR m.tipomedicamento = p_tipo)
    GROUP BY m.idmedicamento, m.nombremed, m.tipomedicamento, m.presentacion
    ORDER BY 1;
$$;

-- 7. Lotes vencidos y por vencer 
CREATE OR REPLACE FUNCTION rep_lotes_por_vencer(p_dias INT)
RETURNS TABLE ("Medicamento" TEXT, "Lote" TEXT, "Caducidad" TEXT, "Días restantes" INT,
               "Stock" INT, "Estado" TEXT, "Valor a costo (Q)" FLOAT8)
LANGUAGE sql STABLE SET search_path = veterinariasonrisas AS $$
    SELECT m.nombremed::TEXT, l.codigolote::TEXT, to_char(l.fechacaducidad, 'YYYY-MM-DD'),
           (l.fechacaducidad - CURRENT_DATE)::INT,
           l.stockactual,
           CASE WHEN l.fechacaducidad < CURRENT_DATE THEN 'Vencido' ELSE 'Por vencer' END,
           round(l.stockactual * l.preciocosto, 2)::FLOAT8
    FROM lote l
    JOIN medicamento m ON m.idmedicamento = l.idmedicamento
    WHERE l.stockactual > 0
      AND l.fechacaducidad <= CURRENT_DATE + COALESCE(p_dias, 30)
    ORDER BY l.fechacaducidad;
$$;

-- 8. Compras por proveedor 
CREATE OR REPLACE FUNCTION rep_compras_por_proveedor(p_desde DATE, p_hasta DATE)
RETURNS TABLE ("Proveedor" TEXT, "Teléfono" TEXT, "Compras" INT, "Unidades" INT, "Total (Q)" FLOAT8)
LANGUAGE sql STABLE SET search_path = veterinariasonrisas AS $$
    SELECT p.nombreproveedor::TEXT, p.telefono::TEXT,
           count(DISTINCT c.idcompra)::INT,
           sum(d.cantidad)::INT,
           round(sum(d.cantidad * d.preciocosto), 2)::FLOAT8
    FROM compra c
    JOIN proveedor p ON p.idproveedor = c.idproveedor
    JOIN compra_detalle d ON d.idcompra = c.idcompra
    WHERE (p_desde IS NULL OR c.fechacompra >= p_desde)
      AND (p_hasta IS NULL OR c.fechacompra <= p_hasta)
    GROUP BY p.idproveedor, p.nombreproveedor, p.telefono
    ORDER BY 5 DESC;
$$;

-- 9. Margen por medicamento 
CREATE OR REPLACE FUNCTION rep_margen_por_medicamento(p_tipo TEXT)
RETURNS TABLE ("Medicamento" TEXT, "Tipo" TEXT, "Costo promedio (Q)" FLOAT8,
               "Precio promedio (Q)" FLOAT8, "Margen (Q)" FLOAT8, "Margen (%)" FLOAT8)
LANGUAGE sql STABLE SET search_path = veterinariasonrisas AS $$
    SELECT m.nombremed::TEXT, m.tipomedicamento::TEXT,
           round(avg(l.preciocosto), 2)::FLOAT8,
           round(avg(l.precioventa), 2)::FLOAT8,
           round(avg(l.precioventa - l.preciocosto), 2)::FLOAT8,
           round(100 * avg(l.precioventa - l.preciocosto) / avg(l.preciocosto), 1)::FLOAT8
    FROM medicamento m
    JOIN lote l ON l.idmedicamento = m.idmedicamento
    WHERE m.aptoparaventa
      AND (p_tipo IS NULL OR m.tipomedicamento = p_tipo)
    GROUP BY m.idmedicamento, m.nombremed, m.tipomedicamento
    ORDER BY 5 DESC;
$$;

-- 10. Agenda de citas
CREATE OR REPLACE FUNCTION rep_agenda_citas(p_desde DATE, p_hasta DATE, p_idempleado INT)
RETURNS TABLE ("Fecha" TEXT, "Hora" TEXT, "Paciente" TEXT, "Dueño" TEXT, "Teléfono" TEXT,
               "Veterinario" TEXT, "Asunto" TEXT, "Estado" TEXT)
LANGUAGE sql STABLE SET search_path = veterinariasonrisas AS $$
    SELECT to_char(c.fechacita, 'YYYY-MM-DD'),
           to_char(c.horainicio, 'HH24:MI') || ' - ' || to_char(c.horafin, 'HH24:MI'),
           p.nombrepaciente::TEXT,
           cl.nombrecliente || ' ' || cl.apellidocliente,
           cl.telefono::TEXT,
           e.nombreempleado || ' ' || e.apellidoempleado,
           c.asuntocita::TEXT, c.estadocita::TEXT
    FROM cita c
    JOIN paciente p ON p.idpaciente = c.idpaciente
    JOIN cliente cl ON cl.idcliente = p.idcliente
    JOIN empleados e ON e.idempleado = c.idempleado
    WHERE c.fechacita >= COALESCE(p_desde, CURRENT_DATE)
      AND c.fechacita <= COALESCE(p_hasta, CURRENT_DATE + 7)
      AND (p_idempleado IS NULL OR c.idempleado = p_idempleado)
    ORDER BY c.fechacita, c.horainicio;
$$;

-- 11. Citas por estado y mes 
CREATE OR REPLACE FUNCTION rep_citas_por_estado(p_desde DATE, p_hasta DATE)
RETURNS TABLE ("Mes" TEXT, "Pendientes" INT, "Confirmadas" INT, "Atendidas" INT,
               "Canceladas" INT, "Total" INT, "Cancelación (%)" FLOAT8)
LANGUAGE sql STABLE SET search_path = veterinariasonrisas AS $$
    SELECT to_char(c.fechacita, 'YYYY-MM'),
           count(*) FILTER (WHERE c.estadocita = 'Pendiente')::INT,
           count(*) FILTER (WHERE c.estadocita = 'Confirmada')::INT,
           count(*) FILTER (WHERE c.estadocita = 'Atendida')::INT,
           count(*) FILTER (WHERE c.estadocita = 'Cancelada')::INT,
           count(*)::INT,
           round(100.0 * count(*) FILTER (WHERE c.estadocita = 'Cancelada') / count(*), 1)::FLOAT8
    FROM cita c
    WHERE (p_desde IS NULL OR c.fechacita >= p_desde)
      AND (p_hasta IS NULL OR c.fechacita <= p_hasta)
    GROUP BY to_char(c.fechacita, 'YYYY-MM')
    ORDER BY 1 DESC;
$$;

-- 12. Diagnósticos más frecuentes 
CREATE OR REPLACE FUNCTION rep_diagnosticos_frecuentes(p_desde DATE, p_hasta DATE, p_especie TEXT)
RETURNS TABLE ("Diagnóstico" TEXT, "Consultas" INT, "Pacientes distintos" INT,
               "Peso promedio (kg)" FLOAT8, "Temperatura promedio (°C)" FLOAT8)
LANGUAGE sql STABLE SET search_path = veterinariasonrisas AS $$
    SELECT COALESCE(c.diagnostico, 'Sin diagnóstico registrado')::TEXT,
           count(*)::INT,
           count(DISTINCT c.idpaciente)::INT,
           round(avg(c.peso), 2)::FLOAT8,
           round(avg(c.temperatura), 1)::FLOAT8
    FROM consulta c
    JOIN paciente p ON p.idpaciente = c.idpaciente
    WHERE (p_desde   IS NULL OR c.fechaconsulta >= p_desde)
      AND (p_hasta   IS NULL OR c.fechaconsulta <= p_hasta)
      AND (p_especie IS NULL OR p.especiepaciente = p_especie)
    GROUP BY COALESCE(c.diagnostico, 'Sin diagnóstico registrado')
    ORDER BY 2 DESC, 1;
$$;

-- 13. Historial clínico de un paciente
-- Une consultas, vacunas y cirugías en una sola línea de tiempo.
CREATE OR REPLACE FUNCTION rep_historial_paciente(p_idpaciente INT)
RETURNS TABLE ("Fecha" TEXT, "Evento" TEXT, "Detalle" TEXT, "Peso (kg)" FLOAT8,
               "Temperatura (°C)" FLOAT8, "Atendió" TEXT)
LANGUAGE sql STABLE SET search_path = veterinariasonrisas AS $$
    SELECT to_char(h.fecha, 'YYYY-MM-DD'), h.evento, h.detalle, h.peso, h.temperatura,
           e.nombreempleado || ' ' || e.apellidoempleado
    FROM (
        SELECT c.fechaconsulta AS fecha,
               CASE WHEN c.idcita IS NULL THEN 'Emergencia' ELSE 'Consulta' END AS evento,
               c.motivoconsulta || COALESCE(' · Dx: ' || c.diagnostico, '')
                                || COALESCE(' · Tx: ' || c.tratamiento, '') AS detalle,
               c.peso::FLOAT8 AS peso, c.temperatura::FLOAT8 AS temperatura, c.idempleado
        FROM consulta c
        WHERE c.idpaciente = p_idpaciente
        UNION ALL
        SELECT d.fechaadministrada, 'Vacuna',
               m.nombremed || ' (' || COALESCE(d.dosis, '1 dosis') || ')'
                           || COALESCE(' · refuerzo ' || to_char(d.proximadosis, 'YYYY-MM-DD'), ''),
               NULL, NULL, d.idempleado
        FROM vacunas_detalle d
        JOIN regvacunas r ON r.idregvacunas = d.idregvacunas
        JOIN lote l ON l.idlote = d.idlote
        JOIN medicamento m ON m.idmedicamento = l.idmedicamento
        WHERE r.idpaciente = p_idpaciente
        UNION ALL
        SELECT d.fechacirugia, 'Cirugía',
               COALESCE(d.nombrecirugia, 'Cirugía') || COALESCE(' · ' || d.motivo, ''),
               NULL, NULL, d.idempleado
        FROM cirugias_detalle d
        JOIN regcirugias r ON r.idregcirugias = d.idregcirugia
        WHERE r.idpaciente = p_idpaciente
    ) AS h
    JOIN empleados e ON e.idempleado = h.idempleado
    ORDER BY h.fecha DESC;
$$;

-- 14. Vacunas con refuerzo próximo 
CREATE OR REPLACE FUNCTION rep_vacunas_proximas(p_dias INT)
RETURNS TABLE ("Próxima dosis" TEXT, "Días restantes" INT, "Paciente" TEXT, "Especie" TEXT,
               "Dueño" TEXT, "Teléfono" TEXT, "Vacuna" TEXT, "Última aplicación" TEXT)
LANGUAGE sql STABLE SET search_path = veterinariasonrisas AS $$
    SELECT to_char(d.proximadosis, 'YYYY-MM-DD'),
           (d.proximadosis - CURRENT_DATE)::INT,
           p.nombrepaciente::TEXT, p.especiepaciente::TEXT,
           c.nombrecliente || ' ' || c.apellidocliente,
           c.telefono::TEXT,
           m.nombremed::TEXT,
           to_char(d.fechaadministrada, 'YYYY-MM-DD')
    FROM vacunas_detalle d
    JOIN regvacunas r ON r.idregvacunas = d.idregvacunas
    JOIN paciente p ON p.idpaciente = r.idpaciente
    JOIN cliente c ON c.idcliente = p.idcliente
    JOIN lote l ON l.idlote = d.idlote
    JOIN medicamento m ON m.idmedicamento = l.idmedicamento
    WHERE d.proximadosis BETWEEN CURRENT_DATE AND CURRENT_DATE + COALESCE(p_dias, 30)
    ORDER BY d.proximadosis, p.nombrepaciente;
$$;

-- 15. Cirugías por tipo y cirujano 
CREATE OR REPLACE FUNCTION rep_cirugias_por_tipo(p_desde DATE, p_hasta DATE)
RETURNS TABLE ("Tipo de cirugía" TEXT, "Procedimiento" TEXT, "Cirujano" TEXT,
               "Cirugías" INT, "Insumos usados" INT)
LANGUAGE sql STABLE SET search_path = veterinariasonrisas AS $$
    SELECT COALESCE(d.tipodecirugia, 'Sin clasificar')::TEXT,
           COALESCE(d.nombrecirugia, 'Sin nombre')::TEXT,
           e.nombreempleado || ' ' || e.apellidoempleado,
           count(*)::INT,
           sum(d.cantidad)::INT
    FROM cirugias_detalle d
    JOIN empleados e ON e.idempleado = d.idempleado
    WHERE (p_desde IS NULL OR d.fechacirugia >= p_desde)
      AND (p_hasta IS NULL OR d.fechacirugia <= p_hasta)
    GROUP BY 1, 2, e.idempleado, e.nombreempleado, e.apellidoempleado
    ORDER BY 1, 4 DESC;
$$;

-- Comprobación: lista las 15 funciones creadas
SELECT proname AS reporte
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'veterinariasonrisas' AND proname LIKE 'rep\_%'
ORDER BY 1;
