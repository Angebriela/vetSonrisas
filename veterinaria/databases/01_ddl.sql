-- VETERINARIA SONRISAS Estructura 

SET client_encoding TO 'UTF8';
DROP SCHEMA IF EXISTS veterinariasonrisas CASCADE;
CREATE SCHEMA veterinariasonrisas;
SET search_path TO veterinariasonrisas;

-- 1. CATÁLOGOS
CREATE TABLE nacionalidad (
    idnacionalidad SERIAL PRIMARY KEY,
    pais VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE rol (
    idrol SERIAL PRIMARY KEY,
    nombrerol VARCHAR(50) NOT NULL UNIQUE,
    detallerol VARCHAR
);

-- 2. PERSONAS
CREATE TABLE empleados (
    idEmpleado SERIAL PRIMARY KEY,
    noIdentificacion VARCHAR(20) NOT NULL UNIQUE,
    nombreEmpleado VARCHAR(100) NOT NULL,
    apellidoEmpleado VARCHAR(100) NOT NULL,
    fechaNacimientoempleado DATE NOT NULL,
    idNacionalidad INT NOT NULL REFERENCES nacionalidad(idnacionalidad),
    idRol INT NOT NULL REFERENCES rol(idrol)
);

CREATE TABLE cliente (
    idCliente SERIAL PRIMARY KEY,
    nit VARCHAR(15) DEFAULT 'CF',
    nombreCliente VARCHAR(100) NOT NULL,
    apellidoCliente VARCHAR(100) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(20)  NOT NULL,
    correo VARCHAR(100),
    esInterno BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE proveedor (
    idProveedor SERIAL PRIMARY KEY,
    nombreProveedor VARCHAR(150) NOT NULL,
    nit VARCHAR(15),
    telefono VARCHAR(20)  NOT NULL,
    correo VARCHAR(100),
    direccion VARCHAR(255)
);

-- 3. PACIENTES E HISTORIAL
CREATE TABLE paciente (
    idPaciente SERIAL PRIMARY KEY,
    idCliente INT NOT NULL REFERENCES cliente(idCliente),
    nombrePaciente VARCHAR(100) NOT NULL,
    especiePaciente VARCHAR(50)  NOT NULL,
    razaPaciente VARCHAR(50),
    sexoPaciente CHAR(1) CHECK (sexopaciente IN ('M', 'H')),   -- Macho o Hembra
    colorPaciente VARCHAR(50),
    fechaNacimiento DATE CHECK (fechanacimiento <= CURRENT_DATE),
    tipoPelaje                   VARCHAR(50),
    identificacionesParticulares VARCHAR,
    finZootecnico                VARCHAR(100)
);

-- Una ficha de antecedentes por paciente (se actualiza, no se duplica).
CREATE TABLE anamnesis (
    noFicha SERIAL PRIMARY KEY,
    idPaciente INT NOT NULL UNIQUE REFERENCES paciente(idPaciente),
    fechaRegistro DATE NOT NULL DEFAULT CURRENT_DATE,
    dieta VARCHAR(100),
    enfermedadesPrevias VARCHAR,
    cirugiasPrevias VARCHAR,
    esterilizado BOOLEAN,
    noPartos INT CHECK (nopartos >= 0),
    desparasitada BOOLEAN,
    viajesRecientes BOOLEAN,
    viveConAnimales BOOLEAN,
    comportamiento  VARCHAR(150)
);

-- 4. INVENTARIO
CREATE TABLE medicamento (
    idMedicamento SERIAL PRIMARY KEY,
    nombreMed VARCHAR(150) NOT NULL,
    contenidoNeto VARCHAR(50),
    tipoMedicamento VARCHAR(50) CHECK (tipoMedicamento IN (
                          'Antibiótico', 'Antiparasitario', 'Antiinflamatorio', 'Analgésico',
                          'Anestésico', 'Vacuna', 'Vitamina', 'Antiséptico', 'Otro')),
    viaAdministracion VARCHAR(50) CHECK (viaAdministracion IN (
                          'Oral', 'Inyectable', 'Tópica', 'Oftálmica', 'Ótica', 'Inhalatoria')),
    presentacion VARCHAR(50) CHECK (presentacion IN (
                          'Tableta', 'Cápsula', 'Suspensión', 'Solución', 'Ampolla',
                          'Frasco', 'Pomada', 'Spray', 'Pipeta', 'Polvo')),
    aptoParaVenta BOOLEAN NOT NULL DEFAULT FALSE,
    usoClinico BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE lote (
    idLote SERIAL PRIMARY KEY,
    idMedicamento INT NOT NULL REFERENCES medicamento(idmedicamento),
    codigoLote VARCHAR(50) NOT NULL,
    fechaCaducidad DATE NOT NULL,
    stockActual INT NOT NULL DEFAULT 0 CHECK (stockactual >= 0),
    precioCosto NUMERIC(10,2) NOT NULL CHECK (precioCosto > 0),
    precioVenta NUMERIC(10,2) NOT NULL CHECK (precioVenta > 0),
    UNIQUE (idmedicamento, codigolote)
);

CREATE TABLE compra (
    idCompra SERIAL PRIMARY KEY,
    idProveedor INT NOT NULL REFERENCES proveedor(idProveedor),
    idEmpleado INT NOT NULL REFERENCES empleados(idEmpleado),
    fechaCompra DATE NOT NULL DEFAULT CURRENT_DATE,
    noFacturaProveedor VARCHAR(50)
);

CREATE TABLE compra_detalle (            
    idCompraDetalle SERIAL PRIMARY KEY,
    idCompra INT NOT NULL REFERENCES compra(idCompra),
    idLote INT NOT NULL REFERENCES lote(idLote),
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precioCosto NUMERIC(10,2) NOT NULL CHECK (precioCosto > 0)
);

-- 5. CITAS Y CONSULTAS
CREATE TABLE cita (
    idCita SERIAL PRIMARY KEY,
    idPaciente INT NOT NULL REFERENCES paciente(idPaciente),
    idEmpleado INT NOT NULL REFERENCES empleados(idEmpleado), 
    asuntoCita VARCHAR(255),
    fechaCita DATE NOT NULL,
    horaInicio TIME NOT NULL,
    horaFin TIME NOT NULL,
    estadoCita VARCHAR(20) NOT NULL DEFAULT 'Pendiente'
               CHECK (estadocita IN ('Pendiente', 'Confirmada', 'Atendida', 'Cancelada')),
    CHECK (horafin > horainicio)
);

CREATE TABLE consulta (
    idConsulta SERIAL PRIMARY KEY,
    idCita INT REFERENCES cita(idCita),
    idPaciente INT NOT NULL REFERENCES paciente(idPaciente),
    idEmpleado INT NOT NULL REFERENCES empleados(idEmpleado),
    motivoConsulta VARCHAR NOT NULL,
    fechaConsulta DATE NOT NULL DEFAULT CURRENT_DATE,
    horaConsulta TIME NOT NULL DEFAULT CURRENT_TIME,
    peso NUMERIC(6,2) CHECK (peso > 0),
    temperatura NUMERIC(4,1) CHECK (temperatura BETWEEN 30 AND 42), 
    diagnostico VARCHAR,
    tratamiento VARCHAR  
);

-- 6. USO CLÍNICO (vacunas y cirugías)
CREATE TABLE regvacunas (
    idRegVacunas SERIAL PRIMARY KEY,
    idPaciente INT NOT NULL UNIQUE REFERENCES paciente(idPaciente),
    fechaApertura DATE NOT NULL DEFAULT CURRENT_DATE 
);

CREATE TABLE vacunas_detalle (
    idDetalleVacuna SERIAL PRIMARY KEY,
    idRegVacunas INT NOT NULL REFERENCES regvacunas(idRegVacunas),
    idLote INT NOT NULL REFERENCES lote(idLote),
    idEmpleado INT REFERENCES empleados(idEmpleado), 
    cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0), 
    dosis VARCHAR(50),
    fechaAdministrada DATE DEFAULT CURRENT_DATE,
    proximaDosis DATE,
    motivo VARCHAR(255),
    CHECK (proximaDosis IS NULL OR proximaDosis > fechaAdministrada)
);

-- Expediente quirúrgico: uno por paciente.
CREATE TABLE regcirugias (
    idRegcirugias SERIAL PRIMARY KEY,
    idPaciente INT NOT NULL UNIQUE REFERENCES paciente(idPaciente),
    fechaApertura DATE NOT NULL DEFAULT CURRENT_DATE 
);

CREATE TABLE cirugias_detalle (
    idDetalleCirugia SERIAL PRIMARY KEY,
    idRegCirugia INT NOT NULL REFERENCES regcirugias(idRegCirugias),
    idLote INT NOT NULL REFERENCES lote(idLote),
    idEmpleado INT NOT NULL REFERENCES empleados(idEmpleado), 
    cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),  
    tipoDeCirugia VARCHAR(100),
    nombreCirugia VARCHAR(150),
    fechaCirugia DATE DEFAULT CURRENT_DATE,
    motivo VARCHAR(255)
);

-- 7. VENTAS
-- Numeración correlativa de facturas (reemplaza el número aleatorio del backend).
CREATE SEQUENCE seq_factura START 1;

CREATE TABLE venta (
    idVenta SERIAL PRIMARY KEY,
    idCliente INT NOT NULL REFERENCES cliente(idCliente),
    idEmpleado INT NOT NULL REFERENCES empleados(idEmpleado),
    fechaVenta DATE DEFAULT CURRENT_DATE,
    horaVenta TIME DEFAULT CURRENT_TIME,
    noFactura VARCHAR(50) NOT NULL UNIQUE
    	DEFAULT ('FAC-' || lpad(nextval('veterinariasonrisas.seq_factura')::text, 6, '0')),
    estado VARCHAR(10) NOT NULL DEFAULT 'Emitida'
        CHECK (estado IN ('Emitida', 'Anulada')),
    motivoanulacion VARCHAR(255), 
    fechaanulacion  TIMESTAMP, 
    CHECK (estado = 'Emitida' OR motivoanulacion IS NOT NULL)
);

CREATE TABLE venta_detalle (
    idDetalleVenta SERIAL PRIMARY KEY,
    idVenta INT NOT NULL REFERENCES venta(idVenta),
    idLote INT NOT NULL REFERENCES lote(idLote),
    cantMedicamento INT NOT NULL CHECK (cantMedicamento > 0),
    precioVenta NUMERIC(10,2) NOT NULL CHECK (precioVenta > 0)
);

-- 8. AUDITORÍA 
CREATE TABLE auditoria (
    idAuditoria BIGSERIAL PRIMARY KEY,
    tabla VARCHAR(50) NOT NULL,
    operacion VARCHAR(10) NOT NULL, 
    idRegistro INT,
    usuario VARCHAR(100) NOT NULL DEFAULT CURRENT_USER,
    fecha TIMESTAMP NOT NULL DEFAULT NOW(),
    datosAnteriores JSONB,
    datosNuevos JSONB
);
