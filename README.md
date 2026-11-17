# Veterinaria Sonrisas

Sistema de una clínica veterinaria con inventario: pacientes, citas, consultas, vacunas,
cirugías, ventas, compras, lotes, reportes e inicio de sesión con roles.

| Carpeta | Contenido |
|---|---|
| `veterinaria/` | Backend: API en NestJS + TypeORM sobre PostgreSQL (esquema `veterinariasonrisas`) |
| `veterinaria/databases/` | Scripts SQL: tablas, triggers, procedimientos, datos de prueba, reportes y usuarios |
| `FRONTEND/` | Frontend en HTML, CSS y JavaScript, sin framework |

## Requisitos

- **Node.js 20 o superior** (probado con Node 24).
- **PostgreSQL 15 o superior** (probado con PostgreSQL 18 en local y 17 en Supabase), con la
  extensión `pgcrypto` disponible (viene incluida en la instalación normal).
- Un servidor de archivos estáticos para el frontend, por ejemplo la extensión
  **Live Server** de VS Code.

## Levantar el proyecto

### 1. Crear la base de datos

Crea una base vacía (por ejemplo `bdveterinariasonrisas`) y ejecuta los scripts **en este orden**
desde la carpeta `veterinaria/databases/`:

```bash
psql -U postgres -c "CREATE DATABASE bdveterinariasonrisas;"

cd veterinaria/databases
psql -U postgres -d bdveterinariasonrisas -f 01_ddl.sql
psql -U postgres -d bdveterinariasonrisas -f 02_triggers.sql
psql -U postgres -d bdveterinariasonrisas -f 03_procedimientos.sql
psql -U postgres -d bdveterinariasonrisas -f 04_datos_prueba.sql
psql -U postgres -d bdveterinariasonrisas -f 05_reportes.sql
psql -U postgres -d bdveterinariasonrisas -f 06_usuarios.sql
```

También puedes abrir cada archivo en DBeaver o pgAdmin y ejecutarlo completo, en el mismo orden.

- `01_ddl.sql` **borra y vuelve a crear** el esquema: no lo ejecutes sobre datos que quieras conservar.
- `06_usuarios.sql` va **después** de `04_datos_prueba.sql`, porque 04 vacía la tabla `usuario`.
  Si vuelves a cargar 04, ejecuta 06 otra vez. Se puede ejecutar varias veces sin error.
- `06_correcciones_triggers.sql` solo hace falta en bases creadas con una versión anterior de
  `02_triggers.sql`. En una instalación nueva no es necesario (no hace daño ejecutarlo).
- Al terminar, `06_usuarios.sql` muestra cuántos usuarios hay: deben ser **250**, con 240 activos.

### 2. Configurar y encender el backend

```bash
cd veterinaria
cp .env.example .env        # en Windows (PowerShell): Copy-Item .env.example .env
```

Edita `veterinaria/.env`:

| Variable | Qué poner |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` | Los datos de tu PostgreSQL |
| `DB_SCHEMA` | `veterinariasonrisas` |
| `DB_SSL` | `false` en local; `true` en Supabase |
| `JWT_SECRET` | Un texto largo y aleatorio. Genéralo con `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `8h` (duración de la sesión) |

Para Supabase, `.env.example` trae comentados los valores del *Session pooler*.

Instala las dependencias y enciende la API:

```bash
npm ci
npm run start:dev
```

La API queda en `http://localhost:3000`. Para comprobarla, abre esa dirección en el navegador:
debe responder `Hello World!`.

### 3. Abrir el frontend

1. Abre la carpeta raíz del proyecto en VS Code.
2. Haz clic derecho en `FRONTEND/html/login.html` y elige **Open with Live Server**.
3. Inicia sesión con uno de los usuarios de la tabla de abajo.

El panel usa módulos de JavaScript, y el navegador los bloquea si abres los archivos con doble
clic (`file://`). Por eso hace falta Live Server u otro servidor de archivos.

Si la API no está en `http://localhost:3000`, cambia la dirección en **Servidor de la API**,
en la pantalla de inicio de sesión.

## Usuarios de prueba

Todos usan la contraseña **`Sonrisas2026!`**.

| Usuario | Rol | Qué puede hacer |
|---|---|---|
| `admin` | Administrador | Todo, incluidos los usuarios y los 15 reportes |
| `veterinario` | Veterinario | Pacientes, anamnesis, citas, consultas, vacunas y cirugías; reportes de Clínica |
| `asistente` | Asistente veterinario | Pacientes, anamnesis, consultas y vacunas; reportes de Clínica |
| `recepcion` | Recepcionista | Clientes, pacientes y citas; reportes de agenda y citas por estado |
| `cajero` | Cajero | Clientes, ventas y detalle de ventas; reportes de Ventas |
| `inventario` | Encargado de inventario | Medicamentos, lotes, proveedores y compras; reportes de Inventario |
| `groomer` | Groomer | Solo consulta pacientes y citas; reporte de agenda de citas |
| `conserje` | Conserje | Sin acceso: el sistema rechaza el inicio de sesión |

- Cada rol ve en el menú solo sus módulos; donde no puede escribir, no aparecen los botones de
  crear, editar ni borrar.
- Los demás empleados también tienen usuario: `emp009` a `emp250`, con los roles repartidos en el
  mismo orden de la tabla (`emp009` es Veterinario, `emp010` Asistente, y así sucesivamente).
- Para probar un usuario **desactivado** usa `emp025`, `emp050`, `emp075` … `emp250` (uno de cada
  25): el sistema responde "Usuario o contraseña incorrectos".
- El administrador crea, edita, desactiva usuarios y cambia contraseñas desde **Usuarios**.
  El rol no se elige ahí: es el del empleado.
- Los permisos de cada rol están en `veterinaria/src/auth/permisos.ts`.

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| El panel se queda en blanco o no reacciona | Abriste el HTML con doble clic. Ábrelo con Live Server. |
| "No se pudo conectar con http://localhost:3000" al iniciar sesión | La API no está encendida, o está en otra dirección: revísala en **Servidor de la API**. |
| El backend no arranca y menciona `JWT_SECRET` | Falta esa variable en `veterinaria/.env`. |
| "Usuario o contraseña incorrectos" con los usuarios de la tabla | No se ejecutó `06_usuarios.sql`, o se volvió a cargar `04_datos_prueba.sql` después. Ejecuta 06 otra vez. |
| Error 500 al guardar una venta y el log menciona `auditoria` | La base se creó con una versión anterior de los triggers. Ejecuta `06_correcciones_triggers.sql`. |
| `EADDRINUSE :3000` al encender el backend | Ya hay otra instancia de la API usando el puerto. Ciérrala o cambia `PORT` en `.env`. |

## Más documentación

- `FRONTEND/README.md`: el panel, el flujo de ventas y el comprobante en PDF.
- `veterinaria/README.md`: notas del backend y de la base de datos.
