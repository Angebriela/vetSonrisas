export const API_DEFAULT = 'http://localhost:3000';

// Listas cerradas: deben coincidir con los CHECK de la base y con common/catalogos.ts del backend
const TIPOS_MEDICAMENTO = ['Antibiótico', 'Antiparasitario', 'Antiinflamatorio', 'Analgésico', 'Anestésico', 'Vacuna', 'Vitamina', 'Antiséptico', 'Otro'];
const VIAS_ADMINISTRACION = ['Oral', 'Inyectable', 'Tópica', 'Oftálmica', 'Ótica', 'Inhalatoria'];
const PRESENTACIONES = ['Tableta', 'Cápsula', 'Suspensión', 'Solución', 'Ampolla', 'Frasco', 'Pomada', 'Spray', 'Pipeta', 'Polvo'];

export const resources = {
    clientes: {
        endpoint: 'clientes', title: 'Clientes', description: 'Personas responsables de las mascotas.', idField: 'idCliente',
        fields: [
            { name: 'nit', label: 'NIT', type: 'text', defaultValue: 'CF', maxLength: 20 }, { name: 'nombreCliente', label: 'Nombre', type: 'text', required: true },
            { name: 'apellidoCliente', label: 'Apellido', type: 'text', required: true }, { name: 'direccion', label: 'Dirección', type: 'text' },
            { name: 'telefono', label: 'Teléfono', type: 'tel', required: true, maxLength: 10, inputMode: 'numeric', pattern: '[0-9]{1,10}', className: 'phone-input' }, { name: 'correo', label: 'Correo electrónico', type: 'email' },
            { name: 'esInterno', label: 'Uso interno de la clínica', type: 'checkbox' },
        ],
    },
    pacientes: {
        endpoint: 'pacientes', title: 'Pacientes', description: 'Mascotas registradas y sus datos clínicos básicos.', idField: 'idPaciente',
        fields: [
            { name: 'idCliente', label: 'Dueño', type: 'select', relation: 'clientes', required: true }, { name: 'nombrePaciente', label: 'Nombre', type: 'text', required: true },
            { name: 'especiePaciente', label: 'Especie', type: 'text', required: true }, { name: 'razaPaciente', label: 'Raza', type: 'text' },
            { name: 'sexoPaciente', label: 'Sexo', type: 'select', options: [{ value: 'M', label: 'Macho' }, { value: 'H', label: 'Hembra' }] }, { name: 'colorPaciente', label: 'Color', type: 'text' }, { name: 'fechaNacimiento', label: 'Fecha de nacimiento', type: 'date' },
            { name: 'tipoPelaje', label: 'Tipo de pelaje', type: 'text' },
            { name: 'identificacionesParticulares', label: 'Identificaciones particulares', type: 'textarea' }, { name: 'finZootecnico', label: 'Fin zootécnico', type: 'text' },
        ],
    },
    citas: {
        endpoint: 'citas', title: 'Citas', description: 'Agenda de atención para los pacientes.', idField: 'idCita',
        fields: [
            { name: 'idPaciente', label: 'Paciente', type: 'select', relation: 'pacientes', required: true }, { name: 'idEmpleado', label: 'Veterinario', type: 'select', relation: 'empleados', required: true },
            { name: 'asuntoCita', label: 'Asunto', type: 'text' },
            { name: 'fechaCita', label: 'Fecha', type: 'date', required: true }, { name: 'horaInicio', label: 'Hora de inicio', type: 'time', required: true },
            { name: 'horaFin', label: 'Hora de finalización', type: 'time', required: true }, { name: 'estadoCita', label: 'Estado', type: 'select', options: ['Pendiente', 'Confirmada', 'Atendida', 'Cancelada'] },
        ],
    },
    consultas: {
        endpoint: 'consultas', title: 'Consultas', description: 'Atenciones realizadas por el personal veterinario.', idField: 'idConsulta',
        fields: [
            { name: 'idCita', label: 'Cita relacionada', type: 'select', relation: 'citas' }, { name: 'idPaciente', label: 'Paciente (obligatorio si no hay cita)', type: 'select', relation: 'pacientes' },
            { name: 'idEmpleado', label: 'Empleado', type: 'select', relation: 'empleados', required: true },
            { name: 'motivoConsulta', label: 'Motivo de consulta', type: 'textarea', required: true }, { name: 'fechaConsulta', label: 'Fecha', type: 'date' }, { name: 'horaConsulta', label: 'Hora', type: 'time' },
            { name: 'peso', label: 'Peso (kg)', type: 'number', step: '0.01' }, { name: 'temperatura', label: 'Temperatura (°C)', type: 'number', step: '0.1' },
            { name: 'diagnostico', label: 'Diagnóstico', type: 'textarea' }, { name: 'tratamiento', label: 'Tratamiento', type: 'textarea' },
        ],
    },
    anamnesis: {
        endpoint: 'anamnesis', title: 'Anamnesis', description: 'Antecedentes y hábitos de cada paciente.', idField: 'noFicha',
        fields: [
            { name: 'idPaciente', label: 'Paciente', type: 'select', relation: 'pacientes', required: true }, { name: 'dieta', label: 'Dieta', type: 'textarea' },
            { name: 'enfermedadesPrevias', label: 'Enfermedades previas', type: 'textarea' }, { name: 'cirugiasPrevias', label: 'Cirugías previas', type: 'textarea' },
            { name: 'esterilizado', label: 'Esterilizado', type: 'checkbox' }, { name: 'noPartos', label: 'Número de partos', type: 'number', step: '1' },
            { name: 'desparasitada', label: 'Desparasitada', type: 'checkbox' }, { name: 'viajesRecientes', label: 'Viajes recientes', type: 'checkbox' },
            { name: 'viveConAnimales', label: 'Vive con otros animales', type: 'checkbox' }, { name: 'comportamiento', label: 'Comportamiento', type: 'textarea' },
        ],
    },
    medicamentos: {
        endpoint: 'medicamentos', title: 'Medicamentos', description: 'Catálogo de productos clínicos y de venta.', idField: 'idMedicamento',
        fields: [
            { name: 'nombreMed', label: 'Nombre', type: 'text', required: true }, { name: 'contenidoNeto', label: 'Contenido neto', type: 'text' },
            { name: 'tipoMedicamento', label: 'Tipo', type: 'select', options: TIPOS_MEDICAMENTO }, { name: 'viaAdministracion', label: 'Vía de administración', type: 'select', options: VIAS_ADMINISTRACION },
            { name: 'presentacion', label: 'Presentación', type: 'select', options: PRESENTACIONES }, { name: 'aptoParaVenta', label: 'Apto para venta', type: 'checkbox' }, { name: 'usoClinico', label: 'Uso clínico', type: 'checkbox', defaultValue: true },
        ],
    },
    lotes: {
        endpoint: 'lotes', title: 'Lotes', description: 'Existencias, costos y vencimientos del inventario.', idField: 'idLote',
        fields: [
            { name: 'idMedicamento', label: 'Medicamento', type: 'select', relation: 'medicamentos', required: true }, { name: 'codigoLote', label: 'Código de lote', type: 'text', required: true },
            { name: 'fechaCaducidad', label: 'Fecha de caducidad', type: 'date', required: true }, { name: 'stockActual', label: 'Stock actual', type: 'number', step: '1', required: true },
            { name: 'precioCosto', label: 'Precio de costo', type: 'number', step: '0.01', required: true }, { name: 'precioVenta', label: 'Precio de venta', type: 'number', step: '0.01', required: true },
        ],
    },
    regvacunas: {
        endpoint: 'regvacunas', title: 'Registros de vacunas', description: 'Libretas de vacunación por paciente.', idField: 'idRegVacunas',
        fields: [{ name: 'idPaciente', label: 'Paciente', type: 'select', relation: 'pacientes', required: true }],
    },
    'vacunas-detalle': {
        endpoint: 'vacunas-detalle', title: 'Detalle de vacunas', description: 'Aplicaciones y dosis administradas.', idField: 'idDetalleVacuna',
        fields: [
            { name: 'idRegVacunas', label: 'Registro de vacunas', type: 'select', relation: 'regvacunas', required: true }, { name: 'idLote', label: 'Lote', type: 'select', relation: 'lotes', required: true },
            { name: 'idEmpleado', label: 'Aplicada por', type: 'select', relation: 'empleados', required: true }, { name: 'cantidad', label: 'Unidades usadas', type: 'number', step: '1', defaultValue: 1 },
            { name: 'dosis', label: 'Dosis', type: 'text' }, { name: 'fechaAdministrada', label: 'Fecha administrada', type: 'date' }, { name: 'proximaDosis', label: 'Próxima dosis', type: 'date' }, { name: 'motivo', label: 'Motivo', type: 'textarea' },
        ],
    },
    regcirugias: {
        endpoint: 'regcirugias', title: 'Registros de cirugías', description: 'Historial quirúrgico por paciente.', idField: 'idRegCirugias',
        fields: [{ name: 'idPaciente', label: 'Paciente', type: 'select', relation: 'pacientes', required: true }],
    },
    'cirugias-detalle': {
        endpoint: 'cirugias-detalle', title: 'Detalle de cirugías', description: 'Procedimientos, motivos y lotes utilizados.', idField: 'idDetalleCirugia',
        fields: [
            { name: 'idRegCirugia', label: 'Registro de cirugía', type: 'select', relation: 'regcirugias', required: true }, { name: 'idLote', label: 'Lote', type: 'select', relation: 'lotes', required: true },
            { name: 'idEmpleado', label: 'Cirujano', type: 'select', relation: 'empleados', required: true }, { name: 'cantidad', label: 'Unidades usadas', type: 'number', step: '1', defaultValue: 1 },
            { name: 'tipoDeCirugia', label: 'Tipo de cirugía', type: 'text' }, { name: 'nombreCirugia', label: 'Nombre de cirugía', type: 'text' },
            { name: 'fechaCirugia', label: 'Fecha de cirugía', type: 'date' }, { name: 'motivo', label: 'Motivo', type: 'textarea' },
        ],
    },
    ventas: {
        endpoint: 'ventas', title: 'Ventas', description: 'Facturación y ventas realizadas en la clínica.', idField: 'idVenta',
        fields: [
            // listOnly: se muestra en el listado pero no en el formulario (lo genera la base de datos)
            { name: 'noFactura', label: 'No. de factura', type: 'text', listOnly: true }, { name: 'estado', label: 'Estado', type: 'text', listOnly: true },
            { name: 'idCliente', label: 'Cliente', type: 'select', relation: 'clientes', required: true }, { name: 'idEmpleado', label: 'Empleado', type: 'select', relation: 'empleados', required: true },
            { name: 'fechaVenta', label: 'Fecha', type: 'date' }, { name: 'horaVenta', label: 'Hora', type: 'time' },
        ],
    },
    'venta-detalle': {
        endpoint: 'venta-detalle', title: 'Detalle de ventas', description: 'Productos y cantidades incluidas en cada venta.', idField: 'idDetalleVenta', specialFilter: true,
        fields: [
            { name: 'idVenta', label: 'Venta', type: 'select', relation: 'ventas', required: true }, { name: 'idLote', label: 'Lote', type: 'select', relation: 'lotes', required: true },
            { name: 'cantMedicamento', label: 'Cantidad', type: 'number', step: '1', required: true }, { name: 'precioVenta', label: 'Precio de venta', type: 'number', step: '0.01', required: true },
        ],
    },
    empleados: {
        endpoint: 'empleados', title: 'Empleados', description: 'Personal que opera la veterinaria.', idField: 'idEmpleado',
        fields: [
            { name: 'noIdentificacion', label: 'No. de identificación', type: 'text', required: true }, { name: 'nombreEmpleado', label: 'Nombre', type: 'text', required: true },
            { name: 'apellidoEmpleado', label: 'Apellido', type: 'text', required: true }, { name: 'fechaNacimientoEmpleado', label: 'Fecha de nacimiento', type: 'date', required: true },
            { name: 'idNacionalidad', label: 'Nacionalidad', type: 'select', relation: 'nacionalidades', required: true }, { name: 'idRol', label: 'Rol', type: 'select', relation: 'roles', required: true },
        ],
    },
    roles: {
        endpoint: 'roles', title: 'Roles', description: 'Perfiles y responsabilidades del personal.', idField: 'idRol',
        fields: [{ name: 'nombreRol', label: 'Nombre del rol', type: 'text', required: true }, { name: 'detalleRol', label: 'Detalle', type: 'textarea' }],
    },
    nacionalidades: {
        endpoint: 'nacionalidades', title: 'Nacionalidades', description: 'Catálogo de nacionalidades del personal.', idField: 'idNacionalidad',
        fields: [{ name: 'pais', label: 'País', type: 'text', required: true }],
    },
    proveedores: {
        endpoint: 'proveedores', title: 'Proveedores', description: 'Empresas a las que se les compra medicamento.', idField: 'idProveedor',
        fields: [
            { name: 'nombreProveedor', label: 'Nombre', type: 'text', required: true }, { name: 'nit', label: 'NIT', type: 'text', maxLength: 15 },
            { name: 'telefono', label: 'Teléfono', type: 'tel', required: true, maxLength: 10, inputMode: 'numeric', pattern: '[0-9]{1,10}', className: 'phone-input' },
            { name: 'correo', label: 'Correo electrónico', type: 'email' }, { name: 'direccion', label: 'Dirección', type: 'text' },
        ],
    },
    compras: {
        endpoint: 'compras', title: 'Compras', description: 'Ingreso de mercadería. Crea la compra y luego agrega sus lotes con el botón «＋ Lote».', idField: 'idCompra',
        fields: [
            { name: 'idProveedor', label: 'Proveedor', type: 'select', relation: 'proveedores', required: true }, { name: 'idEmpleado', label: 'Recibió', type: 'select', relation: 'empleados', required: true },
            { name: 'fechaCompra', label: 'Fecha', type: 'date' }, { name: 'noFacturaProveedor', label: 'Factura del proveedor', type: 'text' },
            { name: 'detalles', label: 'Lotes ingresados', type: 'text', listOnly: true, display: (row) => (row.detalles || []).map((detalle) => `${detalle.lote?.medicamento?.nombreMed || 'Lote'} ×${detalle.cantidad}`).join(', ') || 'Sin lotes' },
        ],
    },
    // Solo visible para el Administrador (lo decide el backend en permisos.lectura).
    // El rol no se elige aquí: se toma del empleado (usuario -> empleado -> rol).
    usuarios: {
        endpoint: 'usuarios', title: 'Usuarios', description: 'Cuentas de acceso al sistema. El rol es el del empleado: para cambiarlo, edita el empleado.', idField: 'idUsuario', deleteLabel: 'Desactivar',
        fields: [
            { name: 'idEmpleado', label: 'Empleado', type: 'select', relation: 'empleados', required: true, createOnly: true, display: (row) => (row.empleado ? `${row.empleado.nombreEmpleado} ${row.empleado.apellidoEmpleado}` : `Empleado #${row.idEmpleado}`) },
            { name: 'rol', label: 'Rol', type: 'text', listOnly: true, display: (row) => row.empleado?.rol?.nombreRol || '—' },
            { name: 'nombreUsuario', label: 'Nombre de usuario', type: 'text', required: true, maxLength: 50 },
            { name: 'contrasena', label: 'Contraseña (mínimo 8 caracteres)', type: 'password', required: true, minLength: 8, createOnly: true },
            { name: 'activo', label: 'Activo', type: 'checkbox', editOnly: true },
            { name: 'ultimoAcceso', label: 'Último acceso', type: 'text', listOnly: true, display: (row) => (row.ultimoAcceso ? new Date(row.ultimoAcceso).toLocaleString('es-GT') : 'Nunca') },
        ],
    },
};
