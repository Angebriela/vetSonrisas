// Deben coincidir letra por letra con los CHECK de 01_ddl.sql
export const TIPOS_MEDICAMENTO = [
  'Antibiótico', 'Antiparasitario', 'Antiinflamatorio', 'Analgésico',
  'Anestésico', 'Vacuna', 'Vitamina', 'Antiséptico', 'Otro',
];

export const VIAS_ADMINISTRACION = [
  'Oral', 'Inyectable', 'Tópica', 'Oftálmica', 'Ótica', 'Inhalatoria',
];

export const PRESENTACIONES = [
  'Tableta', 'Cápsula', 'Suspensión', 'Solución', 'Ampolla',
  'Frasco', 'Pomada', 'Spray', 'Pipeta', 'Polvo',
];

export const ESTADOS_CITA = ['Pendiente', 'Confirmada', 'Atendida', 'Cancelada'];
