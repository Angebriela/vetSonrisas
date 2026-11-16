# Frontend de Veterinaria Sonrisas

El dashboard consume la API de NestJS que está en `../veterinaria`.

## Ejecución

1. Inicia PostgreSQL con la base de datos configurada en `veterinaria/.env`.
2. En una terminal ejecuta:

   ```bash
   cd veterinaria
   npm install
   npm run start:dev
   ```

3. Abre `html/dashboard.html` directamente o sírvelo con cualquier servidor estático.
4. La URL inicial de la API es `http://localhost:3000`. También se puede cambiar desde el campo **API** del dashboard.

El panel incluye operaciones de listado, consulta por ID, creación, edición y eliminación para todos los módulos del backend. En **Detalle de ventas** también está disponible `GET /venta-detalle/venta/:idVenta` mediante el filtro por ID de venta.

## Flujo de ventas

Desde **Ventas → Nuevo registro** se puede:

- elegir un cliente existente o crear uno nuevo sin cerrar la venta;
- agregar uno o varios medicamentos seleccionando lotes con existencias;
- indicar cantidad y precio de venta;
- generar la venta y sus detalles en una sola acción.

El dashboard valida la existencia disponible antes de enviar la operación y utiliza `POST /ventas/completa`, una operación transaccional que guarda la venta y sus detalles juntos. Al insertar cada detalle, los triggers de la base de datos descuentan las unidades del lote.

En el listado de **Ventas**, el botón **PDF** descarga un comprobante con la factura, cliente, NIT, empleado, cargo, medicamentos, cantidades, precios y total.
