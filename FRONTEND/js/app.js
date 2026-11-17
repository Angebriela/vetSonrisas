import { API_DEFAULT, resources } from './config/resources.js';
import { createApiClient } from './services/api.js';
import { renderFormFields, readResourcePayload, readActionPayload } from './components/form-fields.js';
import { renderDataTable } from './components/data-table.js';

const state = {
    apiBase: localStorage.getItem('vet_api_base') || API_DEFAULT,
    currentKey: null,
    currentRows: [],
    editingId: null,
    relationCache: {},
    saleItems: [],
    customAction: null,
    calendarMonth: new Date(),
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const apiRequest = createApiClient(() => state.apiBase);

function showToast(message, type = 'success') {
    const toast = $('#toast');
    toast.textContent = message;
    toast.className = `toast visible ${type}`;
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => { toast.className = 'toast'; }, 4200);
}

function setConnectionState(connected, message = '') {
    const dot = $('#connectionStatus');
    dot.className = `status-dot ${connected ? 'connected' : 'disconnected'}`;
    dot.title = connected ? 'API conectada' : message || 'API no disponible';
    const badge = $('#healthBadge');
    const healthMessage = $('#healthMessage');
    if (badge) {
        badge.className = `badge ${connected ? 'success' : 'danger'}`;
        badge.textContent = connected ? 'Conectada' : 'No disponible';
    }
    if (healthMessage && message) healthMessage.textContent = message;
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
}

function relationLabel(item, resourceKey) {
    if (!item) return '—';
    const resource = resources[resourceKey];
    if (resourceKey === 'clientes') return `${item.nombreCliente || ''} ${item.apellidoCliente || ''}`.trim() || `Cliente #${item.idCliente}`;
    if (resourceKey === 'pacientes') return `${item.nombrePaciente || ''} · ${item.especiePaciente || ''}`.trim() || `Paciente #${item.idPaciente}`;
    if (resourceKey === 'empleados') return `${item.nombreEmpleado || ''} ${item.apellidoEmpleado || ''}`.trim() || `Empleado #${item.idEmpleado}`;
    if (resourceKey === 'medicamentos') return item.nombreMed || `Medicamento #${item.idMedicamento}`;
    if (resourceKey === 'lotes') return item.codigoLote || `Lote #${item.idLote}`;
    if (resourceKey === 'ventas') return item.noFactura || `Venta #${item.idVenta}`;
    if (resourceKey === 'roles') return item.nombreRol || `Rol #${item.idRol}`;
    if (resourceKey === 'nacionalidades') return item.pais || `Nacionalidad #${item.idNacionalidad}`;
    if (resourceKey === 'citas') return `${item.fechaCita || ''}${item.asuntoCita ? ` · ${item.asuntoCita}` : ''}`.trim() || `Cita #${item.idCita}`;
    if (resourceKey === 'proveedores') return item.nombreProveedor || `Proveedor #${item.idProveedor}`;
    if (resourceKey === 'regvacunas') return `Registro #${item.idRegVacunas}`;
    if (resourceKey === 'regcirugias') return `Registro #${item.idRegCirugias}`;
    return resource ? `${resource.title.slice(0, -1)} #${item[resource.idField]}` : `#${item.id}`;
}

function rawFieldValue(row, field) {
    if (row?.[field.name] !== undefined && row?.[field.name] !== null) return row[field.name];
    if (field.relation && row?.[field.relation.slice(0, -1)]) return row[field.relation.slice(0, -1)];
    return '';
}

function displayValue(row, field) {
    if (field.display) return field.display(row);
    const raw = rawFieldValue(row, field);
    if (field.relation) {
        if (raw && typeof raw === 'object') return relationLabel(raw, field.relation);
        const related = (state.relationCache[field.relation] || []).find((item) => String(item[resources[field.relation].idField]) === String(raw));
        return related ? relationLabel(related, field.relation) : (raw ? `#${raw}` : '—');
    }
    if (field.type === 'checkbox') return raw === true || raw === 'true' ? 'Sí' : 'No';
    if (raw === '' || raw === null || raw === undefined) return '—';
    if (field.type === 'date') return String(raw).slice(0, 10);
    return String(raw);
}

async function loadRelationCache(resource) {
    const relations = [...new Set(resource.fields.filter((field) => field.relation).map((field) => field.relation))];
    await Promise.all(relations.map(async (key) => {
        if (!state.relationCache[key]) state.relationCache[key] = await apiRequest(resources[key].endpoint);
    }));
}

function renderStats(values) {
    const definitions = [
        ['clientes', 'Clientes', '◉', 'blue'], ['pacientes', 'Pacientes', '♧', 'mint'], ['citas', 'Citas agendadas', '◷', 'yellow'],
        ['medicamentos', 'Medicamentos', '▥', 'violet'], ['ventas', 'Ventas', '＄', 'orange'], ['empleados', 'Empleados', '♙', 'pink'],
    ];
    $('#statsGrid').innerHTML = definitions.map(([key, label, icon, color]) => `<button class="stat-card ${color}" data-target="${key}" type="button"><span class="stat-icon">${icon}</span><span><strong>${values[key] ?? '—'}</strong><small>${label}</small></span><em>Ver →</em></button>`).join('');
}

async function loadOverview() {
    const keys = ['clientes', 'pacientes', 'citas', 'medicamentos', 'ventas', 'empleados'];
    const results = await Promise.all(keys.map(async (key) => {
        try { return [key, (await apiRequest(resources[key].endpoint)).length]; } catch { return [key, null]; }
    }));
    const values = Object.fromEntries(results);
    renderStats(values);
    if (results.some(([, value]) => value !== null)) setConnectionState(true);
}

function setView(key) {
    const overview = key === 'overview';
    $('#overviewView').classList.toggle('hidden', !overview);
    $('#recordsView').classList.toggle('hidden', overview);
    $$('.nav-link').forEach((link) => link.classList.toggle('active', link.dataset.target === key));
    if (overview) {
        $('#topbarTitle').textContent = 'Resumen general';
        loadOverview();
        return;
    }
    const resource = resources[key];
    state.currentKey = key;
    $('#topbarTitle').textContent = resource.title;
    $('#cardTitle').textContent = resource.title;
    $('#sectionDescription').textContent = resource.description;
    $('#sectionEyebrow').textContent = `Gestión · ${resource.endpoint}`;
    $('#ventaFilter').classList.toggle('hidden', !resource.specialFilter);
    loadRecords();
}

async function loadRecords(path = null) {
    const resource = resources[state.currentKey];
    if (!resource) return;
    const container = $('#tableContainer');
    container.innerHTML = '<div class="loading-state"><span class="spinner"></span><p>Cargando registros…</p></div>';
    try {
        await loadRelationCache(resource);
        const endpoint = path || resource.endpoint;
        state.currentRows = await apiRequest(endpoint);
        setConnectionState(true);
        renderTable(resource, state.currentRows);
    } catch (error) {
        state.currentRows = [];
        setConnectionState(false, error.message);
        container.innerHTML = `<div class="empty-state error-state"><span>!</span><h3>No se pudieron cargar los registros</h3><p>${escapeHtml(error.message)}</p><button class="button button-secondary" data-retry="true" type="button">Reintentar</button></div>`;
    }
}

function renderTable(resource, rows) {
    if (resource.endpoint === 'citas') {
        renderCalendar(resource, rows);
        return;
    }
    $('#tableContainer').innerHTML = renderDataTable(resource, rows, { escapeHtml, displayValue });
}

function calendarDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function calendarMonthLabel(date) {
    return new Intl.DateTimeFormat('es-GT', { month: 'long', year: 'numeric' }).format(date).replace(/^./, (letter) => letter.toUpperCase());
}

function appointmentStatusClass(status) {
    return String(status || 'Pendiente').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
}

function appointmentPatient(row) {
    if (row.paciente) return relationLabel(row.paciente, 'pacientes');
    const patient = (state.relationCache.pacientes || []).find((item) => String(item.idPaciente) === String(row.idPaciente));
    return patient ? relationLabel(patient, 'pacientes') : `Paciente #${row.idPaciente}`;
}

function renderCalendar(resource, rows) {
    const container = $('#tableContainer');
    const currentMonth = state.calendarMonth;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const appointmentsByDate = rows.reduce((groups, row) => {
        const key = String(row.fechaCita || '').slice(0, 10);
        if (!groups[key]) groups[key] = [];
        groups[key].push(row);
        return groups;
    }, {});
    Object.values(appointmentsByDate).forEach((appointments) => appointments.sort((a, b) => String(a.horaInicio || '').localeCompare(String(b.horaInicio || ''))));

    const dayCells = Array.from({ length: cells }, (_, index) => {
        const day = index - firstDay + 1;
        if (day < 1 || day > daysInMonth) return '<div class="calendar-day outside-day"></div>';
        const key = calendarDateKey(year, month, day);
        const appointments = appointmentsByDate[key] || [];
        const isToday = calendarDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) === key;
        const appointmentCards = appointments.map((appointment) => `<div class="calendar-appointment ${appointmentStatusClass(appointment.estadoCita)}"><div class="calendar-appointment-time">${escapeHtml(String(appointment.horaInicio || '').slice(0, 5))}</div><strong>${escapeHtml(appointmentPatient(appointment))}</strong><span>${escapeHtml(appointment.asuntoCita || 'Atención veterinaria')}</span><div class="calendar-appointment-actions">${['Pendiente', 'Confirmada'].includes(appointment.estadoCita) ? `<button class="calendar-action-button" data-action="start-consult" data-id="${escapeHtml(appointment.idCita)}" type="button" title="Iniciar consulta">▶</button><button class="calendar-action-button" data-action="cancel-appointment" data-id="${escapeHtml(appointment.idCita)}" type="button" title="Cancelar cita">✕</button>` : ''}<button class="calendar-action-button" data-action="edit" data-id="${escapeHtml(appointment.idCita)}" type="button" title="Editar cita">✎</button><button class="calendar-action-button" data-action="delete" data-id="${escapeHtml(appointment.idCita)}" type="button" title="Eliminar cita">⌫</button></div></div>`).join('');
        return `<div class="calendar-day${isToday ? ' today' : ''}"><div class="calendar-day-number">${day}</div><div class="calendar-appointments">${appointmentCards || '<span class="calendar-empty">Disponible</span>'}</div></div>`;
    }).join('');

    container.innerHTML = `<div class="calendar-toolbar"><div><p class="eyebrow">Agenda mensual</p><h3>${escapeHtml(calendarMonthLabel(currentMonth))}</h3><p class="calendar-summary">${rows.length} cita${rows.length === 1 ? '' : 's'} registradas</p></div><div class="calendar-controls"><button class="button button-secondary button-small" data-calendar-action="today" type="button">Hoy</button><button class="button button-secondary button-small" data-calendar-action="prev" type="button" aria-label="Mes anterior">‹</button><button class="button button-secondary button-small" data-calendar-action="next" type="button" aria-label="Mes siguiente">›</button></div></div><div class="calendar-weekdays">${weekdays.map((day) => `<span>${day}</span>`).join('')}</div><div class="calendar-grid">${dayCells}</div><div class="calendar-legend"><span><i class="legend-dot pending"></i>Pendiente</span><span><i class="legend-dot confirmed"></i>Confirmada</span><span><i class="legend-dot completed"></i>Atendida</span><span><i class="legend-dot cancelled"></i>Cancelada</span></div>`;
}

const winAnsiCharacters = {
    'á': 0xe1, 'é': 0xe9, 'í': 0xed, 'ó': 0xf3, 'ú': 0xfa, 'ñ': 0xf1, 'ü': 0xfc,
    'Á': 0xc1, 'É': 0xc9, 'Í': 0xcd, 'Ó': 0xd3, 'Ú': 0xda, 'Ñ': 0xd1, 'Ü': 0xdc,
    '¿': 0xbf, '¡': 0xa1, '·': 0xb7,
};

function pdfHexText(value) {
    const bytes = [...String(value ?? '')].map((character) => winAnsiCharacters[character] ?? (character.charCodeAt(0) <= 255 ? character.charCodeAt(0) : 63));
    return `<${bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('')}>`;
}

function pdfText(x, y, value, size = 10, font = 'F1', color = '0.12 0.20 0.30') {
    return `${color} rg BT /${font} ${size} Tf ${x} ${y} Td ${pdfHexText(value)} Tj ET`;
}

function pdfRect(x, y, width, height, color) {
    return `${color} rg ${x} ${y} ${width} ${height} re f`;
}

function pdfLine(x1, y1, x2, y2, color = '0.86 0.90 0.90') {
    return `${color} RG ${x1} ${y1} m ${x2} ${y2} l S`;
}

function truncateText(value, maxLength) {
    const text = String(value ?? '');
    return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function formatReceiptMoney(value) {
    return `Q ${Number(value || 0).toFixed(2)}`;
}

function buildReceiptContent(sale, items, pageItems, pageNumber, totalPages) {
    const content = [];
    const client = sale.cliente || {};
    const employee = sale.empleado || {};
    const clientName = relationLabel(client, 'clientes') || `Cliente #${sale.idCliente}`;
    const employeeName = relationLabel(employee, 'empleados') || `Empleado #${sale.idEmpleado}`;
    const employeeRole = employee.rol?.nombreRol || 'Personal veterinario';
    const invoice = sale.noFactura || `FAC-${String(sale.idVenta).padStart(4, '0')}`;

    content.push(pdfRect(0, 742, 595, 100, '0.09 0.20 0.30'));
    content.push(pdfText(45, 802, 'VETERINARIA SONRISAS', 18, 'F2', '1 1 1'));
    content.push(pdfText(45, 780, 'COMPROBANTE DE VENTA', 10, 'F1', '0.66 0.88 0.88'));
    content.push(pdfText(390, 802, invoice, 14, 'F2', '1 1 1'));
    content.push(pdfText(390, 780, `Venta #${sale.idVenta}`, 9, 'F1', '0.82 0.92 0.92'));

    if (pageNumber === 1) {
        content.push(pdfText(45, 704, 'CLIENTE', 8, 'F2', '0.26 0.60 0.62'));
        content.push(pdfText(45, 684, truncateText(clientName, 40), 11, 'F2'));
        content.push(pdfText(45, 665, `NIT: ${client.nit || 'CF'}`, 9, 'F1', '0.35 0.43 0.48'));
        content.push(pdfText(315, 704, 'EMPLEADO', 8, 'F2', '0.26 0.60 0.62'));
        content.push(pdfText(315, 684, truncateText(employeeName, 35), 11, 'F2'));
        content.push(pdfText(315, 665, `Cargo: ${truncateText(employeeRole, 28)}`, 9, 'F1', '0.35 0.43 0.48'));
        content.push(pdfText(45, 635, `Fecha: ${String(sale.fechaVenta || '').slice(0, 10) || '—'}`, 9, 'F1', '0.35 0.43 0.48'));
        content.push(pdfText(315, 635, `Hora: ${sale.horaVenta || '—'}`, 9, 'F1', '0.35 0.43 0.48'));
    }

    const tableTop = pageNumber === 1 ? 605 : 710;
    content.push(pdfRect(45, tableTop - 18, 505, 22, '0.90 0.96 0.95'));
    content.push(pdfText(52, tableTop - 11, 'PRODUCTO', 8, 'F2', '0.09 0.20 0.30'));
    content.push(pdfText(300, tableTop - 11, 'LOTE', 8, 'F2', '0.09 0.20 0.30'));
    content.push(pdfText(402, tableTop - 11, 'CANT.', 8, 'F2', '0.09 0.20 0.30'));
    content.push(pdfText(445, tableTop - 11, 'PRECIO', 8, 'F2', '0.09 0.20 0.30'));
    content.push(pdfText(505, tableTop - 11, 'IMPORTE', 8, 'F2', '0.09 0.20 0.30'));

    let y = tableTop - 40;
    if (!pageItems.length) {
        content.push(pdfText(52, y, 'Sin medicamentos registrados', 9, 'F1', '0.45 0.53 0.56'));
        y -= 22;
    } else {
        pageItems.forEach((item) => {
            content.push(pdfLine(45, y - 8, 550, y - 8));
            content.push(pdfText(52, y, truncateText(item.product, 34), 8.5));
            content.push(pdfText(300, y, truncateText(item.lot, 15), 8.5));
            content.push(pdfText(405, y, String(item.quantity), 8.5));
            content.push(pdfText(445, y, formatReceiptMoney(item.price), 8.5));
            content.push(pdfText(505, y, formatReceiptMoney(item.amount), 8.5));
            y -= 23;
        });
    }

    if (pageNumber === totalPages) {
        content.push(pdfLine(360, y - 2, 550, y - 2, '0.26 0.60 0.62'));
        content.push(pdfText(405, y - 24, 'TOTAL', 10, 'F2'));
        content.push(pdfText(495, y - 24, formatReceiptMoney(items.reduce((sum, item) => sum + item.amount, 0)), 10, 'F2', '0.09 0.50 0.55'));
        content.push(pdfText(45, 72, 'Gracias por su preferencia.', 9, 'F1', '0.45 0.53 0.56'));
    }
    content.push(pdfText(480, 38, `${pageNumber}/${totalPages}`, 8, 'F1', '0.55 0.62 0.64'));
    return content.join('\n');
}

function createPdfDocument(contents) {
    const pageCount = contents.length;
    const pageRefs = contents.map((_, index) => 5 + index);
    const contentRefs = contents.map((_, index) => 5 + pageCount + index);
    const objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        `<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(' ')}] /Count ${pageCount} >>`,
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    ];
    contents.forEach((_, index) => {
        objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentRefs[index]} 0 R >>`);
    });
    contents.forEach((content) => objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
    let pdf = '%PDF-1.4\n%generated-by-vet-sonrisas\n';
    const offsets = [0];
    objects.forEach((object, index) => {
        offsets.push(pdf.length);
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let index = 1; index < offsets.length; index += 1) pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return new Blob([pdf], { type: 'application/pdf' });
}

async function downloadSaleReceipt(id) {
    try {
        showToast('Generando comprobante PDF…');
        const [sale, details] = await Promise.all([apiRequest(`ventas/${id}`), apiRequest(`venta-detalle/venta/${id}`)]);
        if (!state.relationCache.lotes) state.relationCache.lotes = await apiRequest(resources.lotes.endpoint);
        const items = details.map((detail) => {
            const lot = detail.lote || state.relationCache.lotes.find((item) => String(item.idLote) === String(detail.idLote)) || {};
            const quantity = Number(detail.cantMedicamento || 0);
            const price = Number(detail.precioVenta || 0);
            return { product: lot.medicamento?.nombreMed || 'Medicamento', lot: lot.codigoLote || `#${detail.idLote}`, quantity, price, amount: quantity * price };
        });
        const chunks = [];
        for (let index = 0; index < items.length; index += 18) chunks.push(items.slice(index, index + 18));
        if (!chunks.length) chunks.push([]);
        const contents = chunks.map((chunk, index) => buildReceiptContent(sale, items, chunk, index + 1, chunks.length));
        const blob = createPdfDocument(contents);
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `${sale.noFactura || `venta-${id}`}.pdf`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast('Comprobante descargado correctamente.');
    } catch (error) { showToast(`No se pudo generar el comprobante: ${error.message}`, 'error'); }
}

function renderForm(resource, row = {}) {
    $('#formFields').innerHTML = renderFormFields(resource, row, {
        resources, relationCache: state.relationCache, relationLabel, rawFieldValue, escapeHtml,
    });
}

function saleLotLabel(lote) {
    const medicine = lote.medicamento?.nombreMed || 'Medicamento';
    return `${medicine} · lote ${lote.codigoLote} · stock ${lote.stockActual}`;
}

// El cliente interno (la propia clínica) se marca en la base con cliente.esInterno
function isInternalClient(clientId) {
    const client = (state.relationCache.clientes || []).find((item) => String(item.idCliente) === String(clientId));
    return client?.esInterno === true;
}

function isLotExpired(lote) {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return String(lote.fechaCaducidad || '').slice(0, 10) < todayKey;
}

function isLotAllowedForClient(lote) {
    const clientId = $('#field-idCliente')?.value;
    if (!clientId || isInternalClient(clientId)) return true;
    return lote.medicamento?.aptoParaVenta === true;
}

function renderSaleItems() {
    const container = $('#saleItems');
    const clientId = $('#field-idCliente')?.value;
    const stockHint = $('#saleStockHint');
    if (stockHint) stockHint.textContent = isInternalClient(clientId) ? 'Cliente interno: se permiten todos los medicamentos' : 'Solo se muestran medicamentos aptos para venta';
    const availableLots = (state.relationCache.lotes || []).filter((lote) => Number(lote.stockActual) > 0 && !isLotExpired(lote));
    const allowedLots = availableLots.filter(isLotAllowedForClient);
    const selectedRestrictedLots = [...new Map(state.saleItems.map((item) => findSaleLot(item.idLote)).filter((lote) => lote && !allowedLots.some((allowed) => allowed.idLote === lote.idLote)).map((lote) => [lote.idLote, lote])).values()];
    const lots = [...allowedLots, ...selectedRestrictedLots];
    if (!lots.length) {
        container.innerHTML = '<div class="sale-empty">No hay lotes disponibles para este cliente. Los medicamentos no aptos solo se pueden facturar al cliente interno de la clínica.</div>';
        return;
    }
    if (!state.saleItems.length) {
        container.innerHTML = '<div class="sale-empty">Agrega al menos un medicamento a la venta.</div>';
        return;
    }
    container.innerHTML = state.saleItems.map((item, index) => {
        const options = lots.map((lote) => {
            const allowed = isLotAllowedForClient(lote);
            const label = allowed ? saleLotLabel(lote) : `${saleLotLabel(lote)} · solo cliente interno`;
            return `<option value="${escapeHtml(lote.idLote)}" ${String(lote.idLote) === String(item.idLote) ? 'selected' : ''} ${allowed ? '' : 'disabled'}>${escapeHtml(label)}</option>`;
        }).join('');
        return `<div class="sale-item-row"><div class="sale-item-lot"><label>Lote ${index + 1}</label><select class="sale-lot-select" data-index="${index}"><option value="">Selecciona un lote</option>${options}</select></div><div><label>Cantidad</label><input class="sale-quantity" data-index="${index}" type="number" min="1" step="1" value="${escapeHtml(item.cantMedicamento || 1)}"></div><div><label>Precio de venta</label><input class="sale-price" data-index="${index}" type="number" min="0.01" step="0.01" value="${escapeHtml(item.precioVenta || '')}"></div><button class="icon-button danger-icon sale-item-remove" data-index="${index}" type="button" title="Quitar medicamento">⌫</button></div>`;
    }).join('');
}

function updateSalePartyDetails() {
    const clientSelect = $('#field-idCliente');
    const employeeSelect = $('#field-idEmpleado');
    const client = clientSelect ? (state.relationCache.clientes || []).find((item) => String(item.idCliente) === String(clientSelect.value)) : null;
    const employee = employeeSelect ? (state.relationCache.empleados || []).find((item) => String(item.idEmpleado) === String(employeeSelect.value)) : null;
    const role = employee?.rol?.nombreRol || (state.relationCache.roles || []).find((item) => String(item.idRol) === String(employee?.idRol))?.nombreRol;
    $('#saleClientNit').value = client ? (client.nit || 'CF') : '';
    $('#saleEmployeeRole').value = role || '';
}

async function prepareSaleWorkflow(mode) {
    const workflow = $('#saleWorkflow');
    const isSale = state.currentKey === 'ventas';
    const isNewSale = state.currentKey === 'ventas' && mode === 'create';
    $('#salePartyDetails').classList.toggle('hidden', !isSale);
    if (isSale && !state.relationCache.roles) state.relationCache.roles = await apiRequest(resources.roles.endpoint);
    updateSalePartyDetails();
    workflow.classList.toggle('hidden', !isNewSale);
    if (!isNewSale) return;
    if (!state.relationCache.lotes) state.relationCache.lotes = await apiRequest(resources.lotes.endpoint);
    state.saleItems = [];
    setQuickClientVisibility(false);
    renderSaleItems();
}

function setQuickClientVisibility(visible) {
    const panel = $('#quickClientForm');
    panel.classList.toggle('hidden', !visible);
    panel.querySelectorAll('input').forEach((input) => { input.disabled = !visible; });
    if (!visible) panel.querySelectorAll('input').forEach((input) => { input.value = input.id === 'quickClientNit' ? 'CF' : ''; });
}

function findSaleLot(id) {
    return (state.relationCache.lotes || []).find((lote) => String(lote.idLote) === String(id));
}

function validateSaleItems() {
    if (!state.saleItems.length) return 'Agrega al menos un medicamento a la venta.';
    const quantitiesByLot = {};
    for (const item of state.saleItems) {
        const quantity = Number(item.cantMedicamento);
        const price = Number(item.precioVenta);
        const lot = findSaleLot(item.idLote);
        if (!lot) return 'Selecciona un lote para cada medicamento.';
        const clientId = $('#field-idCliente')?.value;
        if (clientId && !isInternalClient(clientId) && lot.medicamento?.aptoParaVenta !== true) return 'Este medicamento no es apto para venta al público; solo puede facturarse al cliente interno.';
        if (isLotExpired(lot)) return `El lote ${lot.codigoLote} está vencido.`;
        if (!Number.isInteger(quantity) || quantity <= 0) return 'La cantidad de cada medicamento debe ser un entero mayor que cero.';
        if (!Number.isFinite(price) || price <= 0) return 'El precio de venta debe ser mayor que cero.';
        quantitiesByLot[item.idLote] = (quantitiesByLot[item.idLote] || 0) + quantity;
        if (quantitiesByLot[item.idLote] > Number(lot.stockActual)) return `El lote ${lot.codigoLote} solo tiene ${lot.stockActual} unidad(es) disponibles.`;
    }
    return null;
}

function getClientFormFields(prefix) {
    return {
        nit: document.getElementById(`${prefix}Nit`),
        nombreCliente: document.getElementById(`${prefix}Name`),
        apellidoCliente: document.getElementById(`${prefix}LastName`),
        telefono: document.getElementById(`${prefix}Phone`),
        correo: document.getElementById(`${prefix}Email`),
        direccion: document.getElementById(`${prefix}Address`),
    };
}

async function createQuickClient(prefix) {
    const fields = getClientFormFields(prefix);
    fields.telefono.value = fields.telefono.value.replace(/\D/g, '').slice(0, 10);
    if (!fields.nombreCliente.value.trim() || !fields.apellidoCliente.value.trim() || !fields.telefono.value.trim()) {
        showToast('Completa nombre, apellido y teléfono del cliente.', 'error');
        fields.nombreCliente.focus();
        return null;
    }
    if (fields.correo.value.trim() && !fields.correo.checkValidity()) {
        showToast('Escribe un correo electrónico válido.', 'error');
        fields.correo.focus();
        return null;
    }
    const payload = Object.fromEntries(Object.entries(fields).filter(([, input]) => input.value.trim() !== '').map(([key, input]) => [key, input.value.trim()]));
    try {
        const client = await apiRequest('clientes', { method: 'POST', body: JSON.stringify(payload) });
        state.relationCache.clientes = [client, ...(state.relationCache.clientes || [])];
        return client;
    } catch (error) {
        showToast(error.message, 'error');
        return null;
    }
}

function appendClientOption(selectId, client) {
    const select = document.getElementById(selectId);
    if (!select) return;
    const option = document.createElement('option');
    option.value = client.idCliente;
    option.textContent = relationLabel(client, 'clientes');
    select.appendChild(option);
    select.value = client.idCliente;
}

async function saveInlineClient() {
    const client = await createQuickClient('quickClient');
    if (!client) return;
    appendClientOption('field-idCliente', client);
    updateSalePartyDetails();
    renderSaleItems();
    setQuickClientVisibility(false);
    showToast('Cliente creado y seleccionado para la venta.');
}

function setAppointmentClientVisibility(visible) {
    const panel = $('#appointmentClientForm');
    panel.classList.toggle('hidden', !visible);
    panel.querySelectorAll('input').forEach((input) => { input.disabled = !visible; });
    if (!visible) panel.querySelectorAll('input').forEach((input) => { input.value = input.id === 'appointmentClientNit' ? 'CF' : ''; });
}

function setAppointmentPatientVisibility(visible, selectedClientId = null) {
    const panel = $('#appointmentPatientForm');
    panel.classList.toggle('hidden', !visible);
    panel.querySelectorAll('input, select').forEach((input) => { input.disabled = !visible; });
    if (visible) {
        const select = $('#appointmentPatientClient');
        select.innerHTML = '<option value="">Selecciona un cliente</option>';
        (state.relationCache.clientes || []).forEach((client) => appendClientOption('appointmentPatientClient', client));
        select.value = selectedClientId ?? '';
    } else {
        panel.querySelectorAll('input').forEach((input) => { input.value = ''; });
        $('#appointmentPatientClient').innerHTML = '<option value="">Selecciona un cliente</option>';
    }
}

async function saveAppointmentClient() {
    const client = await createQuickClient('appointmentClient');
    if (!client) return;
    setAppointmentClientVisibility(false);
    setAppointmentPatientVisibility(true, client.idCliente);
    showToast('Cliente creado. Ahora registra el paciente relacionado.');
}

async function saveAppointmentPatient() {
    const clientId = $('#appointmentPatientClient').value;
    const name = $('#appointmentPatientName').value.trim();
    const species = $('#appointmentPatientSpecies').value.trim();
    if (!clientId || !name || !species) {
        showToast('Selecciona un cliente y completa nombre y especie del paciente.', 'error');
        return;
    }
    const payload = {
        idCliente: Number(clientId),
        nombrePaciente: name,
        especiePaciente: species,
        razaPaciente: $('#appointmentPatientBreed').value.trim(),
        sexoPaciente: $('#appointmentPatientSex').value.trim(),
        colorPaciente: $('#appointmentPatientColor').value.trim(),
        fechaNacimiento: $('#appointmentPatientBirthDate').value,
    };
    Object.keys(payload).forEach((key) => { if (payload[key] === '' || payload[key] === undefined) delete payload[key]; });
    try {
        const patient = await apiRequest('pacientes', { method: 'POST', body: JSON.stringify(payload) });
        state.relationCache.pacientes = [patient, ...(state.relationCache.pacientes || [])];
        const select = $('#field-idPaciente');
        const option = document.createElement('option');
        option.value = patient.idPaciente;
        option.textContent = relationLabel(patient, 'pacientes');
        select.appendChild(option);
        select.value = patient.idPaciente;
        setAppointmentPatientVisibility(false);
        showToast('Paciente creado, relacionado con el cliente y seleccionado para la cita.');
    } catch (error) { showToast(error.message, 'error'); }
}

async function prepareAppointmentWorkflow(mode) {
    const workflow = $('#appointmentWorkflow');
    const isNewAppointment = state.currentKey === 'citas' && mode === 'create';
    workflow.classList.toggle('hidden', !isNewAppointment);
    if (!isNewAppointment) return;
    if (!state.relationCache.clientes) state.relationCache.clientes = await apiRequest(resources.clientes.endpoint);
    setAppointmentClientVisibility(false);
    setAppointmentPatientVisibility(false);
}

async function openModal(mode = 'create', id = null) {
    const resource = resources[state.currentKey];
    if (!resource) return;
    state.editingId = mode === 'edit' ? id : null;
    let row = {};
    if (mode === 'edit') {
        $('#modalTitle').textContent = 'Cargando registro…';
        $('#entityModal').classList.remove('hidden');
        try { row = await apiRequest(`${resource.endpoint}/${id}`); } catch (error) { showToast(error.message, 'error'); closeModal(); return; }
    }
    await loadRelationCache(resource);
    $('#modalEyebrow').textContent = `${resource.title} · ${mode === 'edit' ? `#${id}` : 'Nuevo'}`;
    $('#modalTitle').textContent = mode === 'edit' ? 'Editar registro' : `Nuevo registro de ${resource.title.toLowerCase()}`;
    $('#submitEntity').textContent = mode === 'edit' ? 'Guardar cambios' : (state.currentKey === 'ventas' ? 'Generar venta' : 'Guardar registro');
    renderForm(resource, row);
    try {
        await prepareSaleWorkflow(mode);
        await prepareAppointmentWorkflow(mode);
    } catch (error) {
        state.saleItems = [];
        $('#saleWorkflow').classList.add('hidden');
        $('#salePartyDetails').classList.add('hidden');
        $('#appointmentWorkflow').classList.add('hidden');
        showToast(`No se pudo preparar el formulario: ${error.message}`, 'error');
    }
    $('#entityModal').classList.remove('hidden');
    document.body.classList.add('modal-open');
    $('#formFields input, #formFields select, #formFields textarea')?.focus();
}

function closeModal() {
    $('#entityModal').classList.add('hidden');
    document.body.classList.remove('modal-open');
    state.editingId = null;
    state.saleItems = [];
    state.customAction = null;
    setQuickClientVisibility(false);
    setAppointmentClientVisibility(false);
    setAppointmentPatientVisibility(false);
}

async function submitForm(event) {
    event.preventDefault();
    const resource = resources[state.currentKey];
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (state.customAction) {
        const { fields, handler } = state.customAction;
        try {
            const message = await handler(readActionPayload(form, fields));
            closeModal();
            showToast(message);
            await loadRecords();
        } catch (error) { showToast(error.message, 'error'); }
        return;
    }
    const payload = readResourcePayload(form, resource);
    const isEditing = Boolean(state.editingId);
    try {
        if (state.currentKey === 'ventas' && !isEditing) {
            const saleError = validateSaleItems();
            if (saleError) { showToast(saleError, 'error'); return; }
            const sale = await apiRequest('ventas/completa', {
                method: 'POST',
                body: JSON.stringify({
                    venta: payload,
                    detalles: state.saleItems.map((item) => ({ idLote: Number(item.idLote), cantMedicamento: Number(item.cantMedicamento), precioVenta: Number(item.precioVenta) })),
                }),
            });
            if (!sale?.idVenta) throw new Error('La API no devolvió el ID de la venta creada.');
            closeModal();
            state.relationCache.lotes = null; // el stock cambió: se vuelve a pedir la próxima vez
            showToast(`Factura ${sale.noFactura} guardada correctamente.`);
            await loadRecords();
            return;
        }
        await apiRequest(isEditing ? `${resource.endpoint}/${state.editingId}` : resource.endpoint, { method: isEditing ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
        closeModal();
        showToast(isEditing ? 'Registro actualizado correctamente.' : 'Registro creado correctamente.');
        await loadRecords();
    } catch (error) { showToast(error.message, 'error'); }
}

// ---------------------------------------------------------------------------
// Acciones especiales. Reutilizan el mismo modal y el mismo generador de
// formularios (renderForm): solo cambian los campos y el endpoint.
// ---------------------------------------------------------------------------
async function openActionModal({ eyebrow, title, submitLabel, fields, row = {}, handler }) {
    await loadRelationCache({ fields });
    state.editingId = null;
    state.customAction = { fields, handler };
    $('#modalEyebrow').textContent = eyebrow;
    $('#modalTitle').textContent = title;
    $('#submitEntity').textContent = submitLabel;
    renderForm({ fields }, row);
    $('#saleWorkflow').classList.add('hidden');
    $('#salePartyDetails').classList.add('hidden');
    $('#appointmentWorkflow').classList.add('hidden');
    $('#entityModal').classList.remove('hidden');
    document.body.classList.add('modal-open');
    $('#formFields input, #formFields select, #formFields textarea')?.focus();
}


function startConsultation(id) {
    const cita = state.currentRows.find((item) => String(item.idCita) === String(id)) || {};
    openActionModal({
        eyebrow: `Cita #${id}`, title: 'Iniciar consulta', submitLabel: 'Iniciar consulta',
        fields: [
            { name: 'idEmpleado', label: 'Veterinario que atiende', type: 'select', relation: 'empleados', required: true },
            { name: 'motivoConsulta', label: 'Motivo de consulta', type: 'textarea', required: true },
        ],
        row: { idEmpleado: cita.idEmpleado, motivoConsulta: cita.asuntoCita || '' },
        handler: async (payload) => {
            await apiRequest(`citas/${id}/iniciar-consulta`, { method: 'POST', body: JSON.stringify(payload) });
            return 'Cita atendida y consulta creada. Completa peso, diagnóstico y tratamiento en Consultas.';
        },
    });
}

async function cancelAppointment(id) {
    if (!window.confirm(`¿Cancelar la cita #${id}?`)) return;
    try {
        await apiRequest(`citas/${id}/cancelar`, { method: 'POST' });
        showToast('Cita cancelada.');
        await loadRecords();
    } catch (error) { showToast(error.message, 'error'); }
}

function voidSale(id) {
    const venta = state.currentRows.find((item) => String(item.idVenta) === String(id)) || {};
    openActionModal({
        eyebrow: `Factura ${venta.noFactura || `#${id}`}`, title: 'Anular factura', submitLabel: 'Anular y devolver stock',
        fields: [{ name: 'motivo', label: 'Motivo de la anulación', type: 'textarea', required: true }],
        handler: async (payload) => {
            await apiRequest(`ventas/${id}/anular`, { method: 'POST', body: JSON.stringify(payload) });
            state.relationCache.lotes = null;
            return 'Factura anulada. El stock volvió a sus lotes.';
        },
    });
}

function addLotToPurchase(id) {
    openActionModal({
        eyebrow: `Compra #${id}`, title: 'Agregar lote a la compra', submitLabel: 'Ingresar lote',
        fields: [
            { name: 'idMedicamento', label: 'Medicamento', type: 'select', relation: 'medicamentos', required: true },
            { name: 'codigoLote', label: 'Código de lote', type: 'text', required: true },
            { name: 'fechaCaducidad', label: 'Fecha de caducidad', type: 'date', required: true },
            { name: 'cantidad', label: 'Cantidad recibida', type: 'number', step: '1', required: true },
            { name: 'precioCosto', label: 'Precio de costo', type: 'number', step: '0.01', required: true },
            { name: 'precioVenta', label: 'Precio de venta', type: 'number', step: '0.01', required: true },
        ],
        handler: async (payload) => {
            await apiRequest(`compras/${id}/lotes`, { method: 'POST', body: JSON.stringify(payload) });
            state.relationCache.lotes = null;
            return 'Lote ingresado. El inventario se actualizó.';
        },
    });
}

async function deleteRecord(id) {
    const resource = resources[state.currentKey];
    const row = state.currentRows.find((item) => String(item[resource.idField]) === String(id));
    if (!window.confirm(`¿Eliminar ${resource.title.toLowerCase().slice(0, -1)}${row ? ` #${id}` : ''}? Esta acción no se puede deshacer.`)) return;
    try {
        await apiRequest(`${resource.endpoint}/${id}`, { method: 'DELETE' });
        showToast('Registro eliminado correctamente.');
        await loadRecords();
    } catch (error) { showToast(error.message, 'error'); }
}

async function checkApi() {
    $('#healthBadge').className = 'badge neutral';
    $('#healthBadge').textContent = 'Comprobando…';
    try {
        const message = await apiRequest('');
        setConnectionState(true, `API conectada correctamente. Respuesta: ${message}`);
        $('#healthMessage').textContent = `API conectada correctamente. Respuesta: ${message}`;
    } catch (error) {
        setConnectionState(false, error.message);
        $('#healthMessage').textContent = `No fue posible conectar con ${state.apiBase}. Verifica que NestJS esté ejecutándose y que la URL sea correcta.`;
    }
}

function saveApiBase() {
    const value = $('#apiBase').value.trim().replace(/\/$/, '');
    state.apiBase = value || API_DEFAULT;
    $('#apiBase').value = state.apiBase;
    localStorage.setItem('vet_api_base', state.apiBase);
    state.relationCache = {};
    checkApi();
    if (state.currentKey) loadRecords(); else loadOverview();
}

document.addEventListener('DOMContentLoaded', () => {
    $('#apiBase').value = state.apiBase;
    $('#menuToggle').addEventListener('click', () => $('#sidebar').classList.toggle('hidden'));
    $('#saveApiBase').addEventListener('click', saveApiBase);
    $('#checkApi').addEventListener('click', checkApi);
    $('#refreshRecords').addEventListener('click', () => loadRecords());
    $('#newRecord').addEventListener('click', () => openModal());
    $('#filterVentaDetails').addEventListener('click', () => {
        const id = $('#ventaFilterId').value.trim();
        if (!id) return loadRecords();
        loadRecords(`${resources['venta-detalle'].endpoint}/venta/${id}`);
    });
    $('#toggleClientForm').addEventListener('click', () => setQuickClientVisibility($('#quickClientForm').classList.contains('hidden')));
    $('#cancelQuickClient').addEventListener('click', () => setQuickClientVisibility(false));
    $('#saveQuickClient').addEventListener('click', saveInlineClient);
    $('#toggleAppointmentClientForm').addEventListener('click', () => setAppointmentClientVisibility($('#appointmentClientForm').classList.contains('hidden')));
    $('#cancelAppointmentClient').addEventListener('click', () => setAppointmentClientVisibility(false));
    $('#saveAppointmentClient').addEventListener('click', saveAppointmentClient);
    $('#toggleAppointmentPatientForm').addEventListener('click', () => setAppointmentPatientVisibility($('#appointmentPatientForm').classList.contains('hidden')));
    $('#cancelAppointmentPatient').addEventListener('click', () => setAppointmentPatientVisibility(false));
    $('#saveAppointmentPatient').addEventListener('click', saveAppointmentPatient);
    $('#addSaleItem').addEventListener('click', () => {
        if (!(state.relationCache.lotes || []).some((lot) => Number(lot.stockActual) > 0 && !isLotExpired(lot))) {
            showToast('No hay lotes con existencias disponibles.', 'error');
            return;
        }
        state.saleItems.push({ idLote: '', cantMedicamento: 1, precioVenta: '' });
        renderSaleItems();
    });
    $('#saleItems').addEventListener('click', (event) => {
        const removeButton = event.target.closest('.sale-item-remove');
        if (!removeButton) return;
        state.saleItems.splice(Number(removeButton.dataset.index), 1);
        renderSaleItems();
    });
    $('#saleItems').addEventListener('change', (event) => {
        const input = event.target;
        const index = Number(input.dataset.index);
        const item = state.saleItems[index];
        if (!item) return;
        if (input.classList.contains('sale-lot-select')) {
            item.idLote = input.value;
            const lot = findSaleLot(item.idLote);
            if (lot) item.precioVenta = Number(lot.precioVenta || 0).toFixed(2);
            renderSaleItems();
        }
    });
    $('#saleItems').addEventListener('input', (event) => {
        const input = event.target;
        const item = state.saleItems[Number(input.dataset.index)];
        if (!item) return;
        if (input.classList.contains('sale-quantity')) item.cantMedicamento = input.value;
        if (input.classList.contains('sale-price')) item.precioVenta = input.value;
    });
    $('#entityForm').addEventListener('change', (event) => {
        if (event.target.id === 'field-idCliente' || event.target.id === 'field-idEmpleado') updateSalePartyDetails();
        if (event.target.id === 'field-idCliente') renderSaleItems();
    });
    document.addEventListener('input', (event) => {
        if (!event.target.classList.contains('phone-input')) return;
        event.target.value = event.target.value.replace(/\D/g, '').slice(0, 10);
    });
    $('#entityForm').addEventListener('submit', submitForm);
    $$('[data-close-modal]').forEach((element) => element.addEventListener('click', closeModal));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !$('#entityModal').classList.contains('hidden')) closeModal(); });

    document.addEventListener('click', (event) => {
        const calendarAction = event.target.closest('[data-calendar-action]');
        if (calendarAction) {
            if (calendarAction.dataset.calendarAction === 'prev') state.calendarMonth.setMonth(state.calendarMonth.getMonth() - 1);
            if (calendarAction.dataset.calendarAction === 'next') state.calendarMonth.setMonth(state.calendarMonth.getMonth() + 1);
            if (calendarAction.dataset.calendarAction === 'today') state.calendarMonth = new Date();
            renderCalendar(resources.citas, state.currentRows);
            return;
        }
        const navTarget = event.target.closest('[data-target]');
        if (navTarget) { event.preventDefault(); setView(navTarget.dataset.target); }
        const action = event.target.closest('[data-action]');
        if (action && action.dataset.action === 'edit') openModal('edit', action.dataset.id);
        if (action && action.dataset.action === 'delete') deleteRecord(action.dataset.id);
        if (action && action.dataset.action === 'download-receipt') downloadSaleReceipt(action.dataset.id);
        if (action && action.dataset.action === 'start-consult') startConsultation(action.dataset.id);
        if (action && action.dataset.action === 'cancel-appointment') cancelAppointment(action.dataset.id);
        if (action && action.dataset.action === 'void-sale') voidSale(action.dataset.id);
        if (action && action.dataset.action === 'add-lot') addLotToPurchase(action.dataset.id);
        if (event.target.closest('[data-new]')) openModal();
        if (event.target.closest('[data-retry]')) loadRecords();
    });

    checkApi();
    loadOverview();
});
