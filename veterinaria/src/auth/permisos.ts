// Permisos por rol. ÚNICA fuente de verdad: el guard (auth.guard.ts) decide con
// puedeAcceder() y el frontend recibe el resultado de permisosDeRol() en el login
// y en GET /auth/perfil, sin duplicar esta tabla.
//
// Los módulos son las rutas de los controladores (@Controller('citas') -> 'citas').
// Las acciones especiales cuentan como escritura de su módulo porque viven bajo
// la misma ruta: citas/:id/iniciar-consulta, citas/:id/cancelar, ventas/:id/anular,
// ventas/completa y compras/:id/lotes.
import { REPORTES } from '../reportes/reportes.definiciones.js';
import type { DefinicionReporte } from '../reportes/reportes.definiciones.js';

export const MODULOS = [
  'clientes', 'pacientes', 'anamnesis', 'citas', 'consultas',
  'regvacunas', 'vacunas-detalle', 'regcirugias', 'cirugias-detalle',
  'medicamentos', 'lotes', 'proveedores', 'compras',
  'ventas', 'venta-detalle', 'empleados', 'roles', 'nacionalidades', 'usuarios',
];

export const SIN_PERMISO = 'Tu rol no tiene permiso para esta acción';
export const SIN_ACCESO = 'Tu rol no tiene acceso al sistema';

export interface Permisos {
  escritura: string[]; // módulos donde puede crear, editar, borrar y usar acciones especiales
  lectura: string[];   // pantallas que ve en el menú (la API deja leer casi todo, ver puedeAcceder)
  reportes: string[];  // claves de los reportes permitidos
}

interface ReglaRol {
  escritura: string[];
  soloLectura?: string[]; // pantallas visibles sin poder escribir
  reportes: string[];
}

const grupo = (nombre: DefinicionReporte['grupo']) =>
  REPORTES.filter((reporte) => reporte.grupo === nombre).map((reporte) => reporte.clave);

// La llave es rol.nombrerol (ver 04_datos_prueba.sql). Un rol que no aparece aquí
// (por ejemplo los "Rol de prueba") no tiene acceso, igual que el Conserje.
const REGLAS: Record<string, ReglaRol> = {
  'Administrador': {
    escritura: MODULOS,
    reportes: REPORTES.map((reporte) => reporte.clave),
  },
  'Veterinario': {
    escritura: ['pacientes', 'anamnesis', 'citas', 'consultas', 'regvacunas', 'vacunas-detalle', 'regcirugias', 'cirugias-detalle'],
    reportes: grupo('Clínica'),
  },
  'Asistente veterinario': {
    escritura: ['pacientes', 'anamnesis', 'consultas', 'regvacunas', 'vacunas-detalle'],
    reportes: grupo('Clínica'),
  },
  'Recepcionista': {
    escritura: ['clientes', 'pacientes', 'citas'],
    reportes: ['agenda-citas', 'citas-por-estado'],
  },
  'Cajero': {
    escritura: ['clientes', 'ventas', 'venta-detalle'],
    reportes: grupo('Ventas'),
  },
  'Encargado de inventario': {
    escritura: ['medicamentos', 'lotes', 'proveedores', 'compras'],
    reportes: grupo('Inventario'),
  },
  'Groomer': {
    escritura: [],
    soloLectura: ['pacientes', 'citas'],
    reportes: ['agenda-citas'],
  },
  'Conserje': {
    escritura: [],
    reportes: [],
  },
};

export function permisosDeRol(nombreRol: string): Permisos {
  const regla = REGLAS[nombreRol];
  if (!regla) return { escritura: [], lectura: [], reportes: [] };
  return {
    escritura: [...regla.escritura],
    lectura: [...new Set([...regla.escritura, ...(regla.soloLectura ?? [])])],
    reportes: [...regla.reportes],
  };
}

export function tieneAcceso(permisos: Permisos) {
  return permisos.lectura.length > 0 || permisos.reportes.length > 0;
}

// Decide si una petición ya autenticada puede pasar.
// - Lectura (GET) compartida: los formularios llenan sus <select> con listas de
//   otros módulos (empleados, lotes, pacientes...), así que leer no se restringe,
//   salvo /usuarios (solo Administrador) y cada /reportes/:clave.
// - Escritura (POST, PATCH, DELETE) solo en los módulos de la tabla del rol.
export function puedeAcceder(permisos: Permisos, metodo: string, modulo: string, claveReporte?: string) {
  if (!tieneAcceso(permisos)) return false;
  if (modulo === 'auth') return true; // GET /auth/perfil
  if (metodo === 'GET' || metodo === 'HEAD') {
    if (modulo === 'usuarios') return permisos.escritura.includes('usuarios');
    if (modulo === 'reportes' && claveReporte) return permisos.reportes.includes(claveReporte);
    return true;
  }
  return permisos.escritura.includes(modulo);
}
