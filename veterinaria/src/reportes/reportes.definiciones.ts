// Catálogo de los 15 reportes. Cada uno apunta a una función de 05_reportes.sql.
// Agregar un reporte nuevo = crear la función en la base y añadir una entrada aquí.

export type TipoFiltro = 'fecha' | 'entero' | 'texto';

export interface FiltroReporte {
  nombre: string;          // nombre del parámetro en la URL (?desde=...)
  etiqueta: string;        // texto que ve el usuario
  tipo: TipoFiltro;
  opciones?: string[];     // lista cerrada -> el frontend dibuja un <select>
  recurso?: string;        // endpoint de donde el frontend llena el <select> (por id)
  requerido?: boolean;
  vacio?: string;          // texto de la opción vacía del <select> (por defecto "Todos")
}

export interface DefinicionReporte {
  clave: string;
  titulo: string;
  descripcion: string;
  grupo: 'Ventas' | 'Inventario' | 'Clínica';
  funcion: string;         // función en el esquema veterinariasonrisas
  filtros: FiltroReporte[]; // en el MISMO orden que los parámetros de la función
}

const DESDE: FiltroReporte = { nombre: 'desde', etiqueta: 'Desde', tipo: 'fecha' };
const HASTA: FiltroReporte = { nombre: 'hasta', etiqueta: 'Hasta', tipo: 'fecha' };
const TIPO_MEDICAMENTO: FiltroReporte = {
  nombre: 'tipo',
  etiqueta: 'Tipo de medicamento',
  tipo: 'texto',
  opciones: ['Antibiótico', 'Antiparasitario', 'Antiinflamatorio', 'Analgésico',
    'Anestésico', 'Vacuna', 'Vitamina', 'Antiséptico', 'Otro'],
};

export const REPORTES: DefinicionReporte[] = [
  {
    clave: 'ventas-por-dia', grupo: 'Ventas', funcion: 'rep_ventas_por_dia',
    titulo: 'Ventas por día',
    descripcion: 'Facturas, unidades y total vendido cada día.',
    filtros: [DESDE, HASTA, { nombre: 'estado', etiqueta: 'Estado', tipo: 'texto', opciones: ['Emitida', 'Anulada'], vacio: 'Solo emitidas' }],
  },
  {
    clave: 'ventas-por-empleado', grupo: 'Ventas', funcion: 'rep_ventas_por_empleado',
    titulo: 'Ventas por empleado',
    descripcion: 'Cuánto facturó cada empleado en el período.',
    filtros: [DESDE, HASTA],
  },
  {
    clave: 'medicamentos-mas-vendidos', grupo: 'Ventas', funcion: 'rep_medicamentos_mas_vendidos',
    titulo: 'Medicamentos más vendidos',
    descripcion: 'Ranking de medicamentos por unidades vendidas.',
    filtros: [DESDE, HASTA, TIPO_MEDICAMENTO],
  },
  {
    clave: 'ventas-anuladas', grupo: 'Ventas', funcion: 'rep_ventas_anuladas',
    titulo: 'Facturas anuladas',
    descripcion: 'Facturas anuladas con su motivo y la fecha de anulación.',
    filtros: [DESDE, HASTA],
  },
  {
    clave: 'consumo-interno', grupo: 'Ventas', funcion: 'rep_consumo_interno',
    titulo: 'Consumo interno de la clínica',
    descripcion: 'Medicamentos facturados al cliente interno, valorados al costo.',
    filtros: [DESDE, HASTA],
  },
  {
    clave: 'existencias', grupo: 'Inventario', funcion: 'rep_existencias',
    titulo: 'Existencias y valor del inventario',
    descripcion: 'Stock vigente por medicamento y su valor a costo y a precio de venta.',
    filtros: [TIPO_MEDICAMENTO],
  },
  {
    clave: 'lotes-por-vencer', grupo: 'Inventario', funcion: 'rep_lotes_por_vencer',
    titulo: 'Lotes vencidos y por vencer',
    descripcion: 'Lotes con existencia que ya vencieron o vencen en los próximos días.',
    filtros: [{ nombre: 'dias', etiqueta: 'Días hacia adelante (30 por defecto)', tipo: 'entero' }],
  },
  {
    clave: 'compras-por-proveedor', grupo: 'Inventario', funcion: 'rep_compras_por_proveedor',
    titulo: 'Compras por proveedor',
    descripcion: 'Compras, unidades y monto por proveedor.',
    filtros: [DESDE, HASTA],
  },
  {
    clave: 'margen-por-medicamento', grupo: 'Inventario', funcion: 'rep_margen_por_medicamento',
    titulo: 'Margen por medicamento',
    descripcion: 'Costo y precio promedio, y margen de los medicamentos aptos para venta.',
    filtros: [TIPO_MEDICAMENTO],
  },
  {
    clave: 'agenda-citas', grupo: 'Clínica', funcion: 'rep_agenda_citas',
    titulo: 'Agenda de citas',
    descripcion: 'Citas del período (por defecto, de hoy a 7 días), opcionalmente de un veterinario.',
    filtros: [DESDE, HASTA, { nombre: 'idEmpleado', etiqueta: 'Veterinario', tipo: 'entero', recurso: 'empleados' }],
  },
  {
    clave: 'citas-por-estado', grupo: 'Clínica', funcion: 'rep_citas_por_estado',
    titulo: 'Citas por estado y mes',
    descripcion: 'Citas pendientes, confirmadas, atendidas y canceladas por mes.',
    filtros: [DESDE, HASTA],
  },
  {
    clave: 'diagnosticos-frecuentes', grupo: 'Clínica', funcion: 'rep_diagnosticos_frecuentes',
    titulo: 'Diagnósticos más frecuentes',
    descripcion: 'Diagnósticos registrados en consulta, con peso y temperatura promedio.',
    filtros: [DESDE, HASTA, {
      nombre: 'especie', etiqueta: 'Especie', tipo: 'texto',
      opciones: ['Canino', 'Felino', 'Conejo', 'Ave', 'Equino', 'Bovino'],
    }],
  },
  {
    clave: 'historial-paciente', grupo: 'Clínica', funcion: 'rep_historial_paciente',
    titulo: 'Historial clínico de un paciente',
    descripcion: 'Consultas, vacunas y cirugías de un paciente en orden cronológico, con su peso.',
    filtros: [{ nombre: 'idPaciente', etiqueta: 'Paciente', tipo: 'entero', recurso: 'pacientes', requerido: true }],
  },
  {
    clave: 'vacunas-proximas', grupo: 'Clínica', funcion: 'rep_vacunas_proximas',
    titulo: 'Vacunas con refuerzo próximo',
    descripcion: 'Pacientes cuyo refuerzo toca en los próximos días, con el teléfono del dueño.',
    filtros: [{ nombre: 'dias', etiqueta: 'Días hacia adelante (30 por defecto)', tipo: 'entero' }],
  },
  {
    clave: 'cirugias-por-tipo', grupo: 'Clínica', funcion: 'rep_cirugias_por_tipo',
    titulo: 'Cirugías por tipo y cirujano',
    descripcion: 'Cantidad de cirugías por tipo, procedimiento y cirujano.',
    filtros: [DESDE, HASTA],
  },
];
