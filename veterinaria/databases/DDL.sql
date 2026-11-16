-- Creación de la base de datos
-- CREATE DATABASE veterinariasonrisas;

-- 1. Tablas principales (sin llaves foráneas)
CREATE TABLE nacionalidad (
    idnacionalidad SERIAL PRIMARY KEY,
    pais VARCHAR(100) not null
);

CREATE TABLE rol (
    idrol SERIAL PRIMARY KEY,
    nombrerol VARCHAR(50) not null,
    detallerol VARCHAR
);

CREATE TABLE cliente (
    idcliente SERIAL PRIMARY KEY,
    nit VARCHAR(15) DEFAULT 'CF',
    nombrecliente VARCHAR(100) NOT NULL,
    apellidocliente VARCHAR(100) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(20) NOT NULL,
    correo VARCHAR(100)
);

CREATE TABLE medicamento (
    idmedicamento SERIAL PRIMARY KEY,
    nombremed VARCHAR(150) NOT NULL,
    contenidoneto VARCHAR(50),
    tipomedicamento VARCHAR(50),
    viaadministracion VARCHAR(50),
    presentacion VARCHAR(50),
    aptoparaventa BOOL DEFAULT FALSE NOT NULL,
    usoclinico BOOL DEFAULT TRUE NOT NULL
);

-- 2. Tablas con dependencias de primer nivel
CREATE TABLE empleados (
    idempleado SERIAL PRIMARY KEY,
    noidentificacion VARCHAR(20) UNIQUE NOT NULL,
    nombreempleado VARCHAR(100) NOT NULL,
    apellidoempleado VARCHAR(100) NOT NULL,
    fechanacimientoempleado DATE NOT NULL,
    idnacionalidad INT NOT NULL REFERENCES nacionalidad(idnacionalidad),
    idrol INT NOT NULL REFERENCES rol(idrol),
);

CREATE TABLE paciente (
    idpaciente SERIAL PRIMARY KEY,
    idcliente INT NOT NULL REFERENCES cliente(idcliente),
    nombrepaciente VARCHAR(100) NOT NULL,
    especiepaciente VARCHAR(50) NOT NULL,
    razapaciente VARCHAR(50),
    sexopaciente CHAR(1),
    colorpaciente VARCHAR(50),
    fechanacimiento DATE,
    pesopaciente NUMERIC(5, 2),
    tipopelaje VARCHAR(50),
    identificacionesparticulares VARCHAR,
    finzootecnico VARCHAR(100)
);

CREATE TABLE lote (
    idlote SERIAL PRIMARY KEY,
    idmedicamento INT NOT NULL REFERENCES medicamento(idmedicamento),
    codigolote VARCHAR(50) NOT NULL,
    fechacaducidad DATE NOT NULL,
    stockactual INT NOT NULL CHECK (stockActual >= 0),
    preciocosto NUMERIC(10, 2) not null
);

-- 3. Tablas con dependencias a Paciente y Empleados
CREATE TABLE anamnesis (
    noficha SERIAL PRIMARY KEY,
    idpaciente INT NOT NULL REFERENCES paciente(idpaciente),
    dieta VARCHAR(100),
    enfermedadesprevias VARCHAR,
    cirugiasprevias VARCHAR,
    esterilizado BOOL,
    nopartos INT,
    desparasitada BOOL,
    viajesrecientes BOOL,
    viveconanimales BOOL,
    comportamiento VARCHAR(150)
);

CREATE TABLE cita (
    idcita SERIAL PRIMARY KEY,
    idpaciente INT NOT NULL REFERENCES paciente(idPaciente),
    asuntocita VARCHAR(255),
    fechacita DATE NOT NULL,
    horainicio TIME NOT NULL,
    horafin TIME NOT NULL,
    estadocita VARCHAR(20) DEFAULT 'Pendiente' -- Pendiente, Completada, Cancelada
);,

CREATE TABLE regvacunas (
    idregvacunas SERIAL PRIMARY KEY,
    idpaciente INT NOT NULL REFERENCES paciente(idpaciente)
);

CREATE TABLE regcirugias (
    idregcirugias SERIAL PRIMARY KEY,
    idpaciente INT NOT NULL REFERENCES paciente(idpaciente)
);

CREATE TABLE venta (
    idventa SERIAL PRIMARY KEY,
    idcliente INT NOT NULL REFERENCES CLIENTE(idCliente),
    idempleado INT NOT NULL REFERENCES EMPLEADOS(idEmpleado),
    fechaventa DATE DEFAULT CURRENT_DATE,
    horaventa TIME DEFAULT CURRENT_TIME,
    nofactura VARCHAR(50) UNIQUE NOT NULL
);

-- 4. Tablas con dependencias de tercer nivel (Detalles, Consultas, etc.)
CREATE TABLE consulta (
    idconsulta SERIAL PRIMARY KEY,
    idcita INT REFERENCES CITA(idCita), -- Permite NULL si es emergencia,
    idempleado INT NOT NULL REFERENCES EMPLEADOS(idEmpleado),
    motivoconsulta VARCHAR NOT NULL,
    fechaconsulta DATE NOT NULL DEFAULT CURRENT_DATE,
    horaconsulta TIME NOT NULL DEFAULT CURRENT_TIME
);

CREATE TABLE vacunas_detalle (
    iddetallevacuna SERIAL PRIMARY KEY,
    idregvacunas INT NOT NULL REFERENCES REGVACUNAS(idRegVacunas),
    idlote INT NOT NULL REFERENCES LOTE(idLote),
    dosis VARCHAR(50),
    fechaadministrada DATE DEFAULT CURRENT_DATE,
    motivo VARCHAR(255)
);

CREATE TABLE cirugias_detalle (
    iddetallecirugia SERIAL PRIMARY KEY,
    idregcirugia INT NOT NULL REFERENCES REGCIRUGIAS(idRegCirugias),
    idlote INT NOT NULL REFERENCES LOTE(idLote),
    tipodecirugia VARCHAR(100),
    nombrecirugia VARCHAR(150),
    fechacirugia DATE DEFAULT CURRENT_DATE,
    motivo VARCHAR(255)
);

CREATE TABLE venta_detalle (
    iddetalleventa SERIAL PRIMARY KEY,
    idventa INT NOT NULL REFERENCES VENTA(idVenta),
    idlote INT NOT NULL REFERENCES LOTE(idLote),
    cantmedicamento INT NOT NULL CHECK (cantMedicamento > 0),
    precioventa NUMERIC(10, 2) NOT NULL
);
