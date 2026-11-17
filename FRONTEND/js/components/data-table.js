// canWrite: el rol puede crear, editar, borrar y usar las acciones especiales de este módulo.
// Sin escritura solo se muestran las acciones de consulta (por ejemplo, el PDF de una venta).
export function renderDataTable(resource, rows, { escapeHtml, displayValue, canWrite = true }) {
    if (!rows.length) {
        return `<div class="empty-state"><span>⌁</span><h3>Aún no hay registros</h3><p>${canWrite ? `Agrega el primer registro de ${resource.title.toLowerCase()}.` : `No hay ${resource.title.toLowerCase()} para mostrar.`}</p>${canWrite ? '<button class="button" data-new="true" type="button">＋ Crear registro</button>' : ''}</div>`;
    }
    // Las contraseñas nunca se listan
    const visibleFields = resource.fields.filter((field) => field.type !== 'password').slice(0, 7);
    const headers = [resource.idField, ...visibleFields.map((field) => field.label)];
    const deleteLabel = resource.deleteLabel || 'Eliminar';
    const tableRows = rows.map((row) => {
        const id = row[resource.idField];
        let receiptAction = resource.endpoint === 'ventas' ? `<button class="icon-button receipt-icon" data-action="download-receipt" data-id="${escapeHtml(id)}" title="Descargar comprobante PDF">PDF</button>` : '';
        if (canWrite && resource.endpoint === 'ventas' && row.estado === 'Emitida') receiptAction += `<button class="icon-button text-action danger-icon" data-action="void-sale" data-id="${escapeHtml(id)}" title="Anular factura y devolver el stock">Anular</button>`;
        if (canWrite && resource.endpoint === 'compras') receiptAction += `<button class="icon-button text-action" data-action="add-lot" data-id="${escapeHtml(id)}" title="Agregar un lote a esta compra">＋ Lote</button>`;
        if (canWrite && resource.endpoint === 'usuarios') receiptAction += `<button class="icon-button text-action" data-action="change-password" data-id="${escapeHtml(id)}" title="Cambiar la contraseña de este usuario">Cambiar contraseña</button>`;
        const writeActions = canWrite ? [`<button class="icon-button" data-action="edit" data-id="${escapeHtml(id)}" title="Editar">✎</button>`, `<button class="icon-button danger-icon" data-action="delete" data-id="${escapeHtml(id)}" title="${deleteLabel}">⌫</button>`] : ['', ''];
        return `<tr><td class="id-cell">#${escapeHtml(id)}</td>${visibleFields.map((field) => `<td>${escapeHtml(displayValue(row, field))}</td>`).join('')}<td class="actions-cell">${writeActions[0]}${receiptAction}${writeActions[1]}</td></tr>`;
    }).join('');
    return `<table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header === resource.idField ? 'ID' : header)}</th>`).join('')}<th>Acciones</th></tr></thead><tbody>${tableRows}</tbody></table><div class="table-footer">${rows.length} registro${rows.length === 1 ? '' : 's'} encontrados</div>`;
}
