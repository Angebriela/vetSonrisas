// Tamaños de página que puede elegir el usuario
export const PAGE_SIZES = [10, 25, 50, 100];

export function pageCount(total, pageSize) {
    return Math.max(1, Math.ceil(total / pageSize));
}

// Ancho fijo de la columna Acciones según los botones que lleva cada módulo.
// Con table-layout: fixed (computadora) las demás columnas se reparten el resto.
function actionsWidth(resource, canWrite) {
    let width = 34; // relleno de la celda
    if (canWrite) width += 66; // editar y borrar
    if (resource.endpoint === 'ventas') width += 33 + (canWrite ? 64 : 0); // PDF y Anular
    if (canWrite && resource.endpoint === 'compras') width += 64; // ＋ Lote
    if (canWrite && resource.endpoint === 'usuarios') width += 132; // Cambiar contraseña
    return Math.max(width, 90);
}

// Números de página visibles: la primera, la última y las vecinas de la actual
function visiblePages(page, total) {
    const pages = new Set([1, total, page - 1, page, page + 1].filter((value) => value >= 1 && value <= total));
    return [...pages].sort((a, b) => a - b);
}

function renderPagination(total, page, pageSize, escapeHtml) {
    const pages = pageCount(total, pageSize);
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);
    const button = (target, label, text, nav, disabled = false, current = false) => `<button class="page-button${typeof nav === 'number' ? ' page-number' : ''}" type="button" data-page="${target}" data-page-nav="${nav}" aria-label="${escapeHtml(label)}"${current ? ' aria-current="page"' : ''}${disabled ? ' disabled' : ''}>${text}</button>`;
    let numbers = '';
    let previous = 0;
    visiblePages(page, pages).forEach((number) => {
        if (number - previous > 1) numbers += '<span class="page-gap" aria-hidden="true">…</span>';
        numbers += button(number, `Página ${number}`, number, number, false, number === page);
        previous = number;
    });
    const sizes = PAGE_SIZES.map((size) => `<option value="${size}"${size === pageSize ? ' selected' : ''}>${size}</option>`).join('');
    return `<nav class="pagination" aria-label="Paginación de registros">
        <p class="pagination-info">Mostrando <strong>${from.toLocaleString('es-GT')}–${to.toLocaleString('es-GT')}</strong> de <strong>${total.toLocaleString('es-GT')}</strong> registro${total === 1 ? '' : 's'}</p>
        <div class="pagination-controls">
            <label class="pagination-size">Filas por página <select id="pageSize">${sizes}</select></label>
            ${pages > 1 ? `<div class="pagination-pages">
                ${button(1, 'Primera página', '«', 'first', page === 1)}
                ${button(page - 1, 'Página anterior', '‹', 'prev', page === 1)}
                ${numbers}
                <span class="page-status">Página ${page} de ${pages}</span>
                ${button(page + 1, 'Página siguiente', '›', 'next', page === pages)}
                ${button(pages, 'Última página', '»', 'last', page === pages)}
            </div>` : ''}
        </div>
    </nav>`;
}

// canWrite: el rol puede crear, editar, borrar y usar las acciones especiales de este módulo.
// Sin escritura solo se muestran las acciones de consulta (por ejemplo, el PDF de una venta).
// page y pageSize: solo se dibujan las filas de la página actual.
export function renderDataTable(resource, rows, { escapeHtml, displayValue, canWrite = true, page = 1, pageSize = PAGE_SIZES[0] }) {
    if (!rows.length) {
        return `<div class="empty-state"><span>⌁</span><h3>Aún no hay registros</h3><p>${canWrite ? `Agrega el primer registro de ${resource.title.toLowerCase()}.` : `No hay ${resource.title.toLowerCase()} para mostrar.`}</p>${canWrite ? '<button class="button" data-new="true" type="button">＋ Crear registro</button>' : ''}</div>`;
    }
    // Las contraseñas nunca se listan
    const visibleFields = resource.fields.filter((field) => field.type !== 'password').slice(0, 7);
    const headers = [resource.idField, ...visibleFields.map((field) => field.label)];
    const deleteLabel = resource.deleteLabel || 'Eliminar';
    const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);
    const tableRows = pageRows.map((row) => {
        const id = row[resource.idField];
        let receiptAction = resource.endpoint === 'ventas' ? `<button class="icon-button receipt-icon" data-action="download-receipt" data-id="${escapeHtml(id)}" title="Descargar comprobante PDF">PDF</button>` : '';
        if (canWrite && resource.endpoint === 'ventas' && row.estado === 'Emitida') receiptAction += `<button class="icon-button text-action danger-icon" data-action="void-sale" data-id="${escapeHtml(id)}" title="Anular factura y devolver el stock">Anular</button>`;
        if (canWrite && resource.endpoint === 'compras') receiptAction += `<button class="icon-button text-action" data-action="add-lot" data-id="${escapeHtml(id)}" title="Agregar un lote a esta compra">＋ Lote</button>`;
        if (canWrite && resource.endpoint === 'usuarios') receiptAction += `<button class="icon-button text-action" data-action="change-password" data-id="${escapeHtml(id)}" title="Cambiar la contraseña de este usuario">Cambiar contraseña</button>`;
        const writeActions = canWrite ? [`<button class="icon-button" data-action="edit" data-id="${escapeHtml(id)}" title="Editar">✎</button>`, `<button class="icon-button danger-icon" data-action="delete" data-id="${escapeHtml(id)}" title="${deleteLabel}">⌫</button>`] : ['', ''];
        // title: en computadora los textos largos se cortan con "…" y el texto completo aparece al pasar el mouse
        return `<tr><td class="id-cell">#${escapeHtml(id)}</td>${visibleFields.map((field) => { const text = escapeHtml(displayValue(row, field)); return `<td title="${text}">${text}</td>`; }).join('')}<td class="actions-cell">${writeActions[0]}${receiptAction}${writeActions[1]}</td></tr>`;
    }).join('');
    const columns = `<colgroup><col class="id-col">${visibleFields.map(() => '<col>').join('')}<col style="width:${actionsWidth(resource, canWrite)}px"></colgroup>`;
    const head = headers.map((header) => { const text = escapeHtml(header === resource.idField ? 'ID' : header); return `<th scope="col" title="${text}">${text}</th>`; }).join('');
    // Solo la tabla se desplaza de lado (en teléfono); la paginación queda siempre visible debajo
    return `<div class="records-scroll"><table class="records-table">${columns}<thead><tr>${head}<th scope="col" class="actions-head">Acciones</th></tr></thead><tbody>${tableRows}</tbody></table></div>${renderPagination(rows.length, page, pageSize, escapeHtml)}`;
}
