// ---------------------------------------------------------------------------
// Reportes · Veterinaria Sonrisas
// Una sola pantalla sirve a los 15 reportes: el backend (GET /reportes) dice
// qué reportes existen y qué filtros tiene cada uno, y este archivo dibuja el
// formulario, la tabla y las exportaciones a partir de esa descripción.
// ---------------------------------------------------------------------------
const API_BASE = (localStorage.getItem('vet_api_base') || 'http://localhost:3000').replace(/\/$/, '');

const state = { catalog: [], current: null, result: null, options: {} };

const $ = (selector) => document.querySelector(selector);

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
}

function showToast(message, type = 'success') {
    const toast = $('#toast');
    toast.textContent = message;
    toast.className = `toast visible ${type}`;
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => { toast.className = 'toast'; }, 4200);
}

async function apiRequest(path) {
    const response = await fetch(`${API_BASE}/${path}`, { headers: { Accept: 'application/json' } });
    const text = await response.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    if (!response.ok) {
        const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message || `Error HTTP ${response.status}`;
        throw new Error(message);
    }
    return body;
}

// Texto que se muestra en los <select> que se llenan desde otro recurso
function optionLabel(resource, item) {
    if (resource === 'empleados') return `${item.nombreEmpleado} ${item.apellidoEmpleado}${item.rol?.nombreRol ? ` · ${item.rol.nombreRol}` : ''}`;
    if (resource === 'pacientes') return `${item.nombrePaciente} · ${item.especiePaciente} (#${item.idPaciente})`;
    return String(Object.values(item)[1] ?? Object.values(item)[0]);
}

function optionId(resource, item) {
    if (resource === 'empleados') return item.idEmpleado;
    if (resource === 'pacientes') return item.idPaciente;
    return Object.values(item)[0];
}

function renderMenu() {
    const groups = [...new Set(state.catalog.map((report) => report.grupo))];
    $('#reportMenu').innerHTML = groups.map((group) => `<h4>${escapeHtml(group)}</h4>${state.catalog
        .filter((report) => report.grupo === group)
        .map((report) => `<button class="report-item${state.current?.clave === report.clave ? ' active' : ''}" data-report="${escapeHtml(report.clave)}" type="button">${escapeHtml(report.titulo)}</button>`)
        .join('')}`).join('');
}

async function selectReport(key) {
    const report = state.catalog.find((item) => item.clave === key);
    if (!report) return;
    state.current = report;
    state.result = null;
    renderMenu();
    $('#reportGroup').textContent = `Reportes · ${report.grupo}`;
    $('#reportTitle').textContent = report.titulo;
    $('#reportDescription').textContent = report.descripcion;
    $('#reportSummary').textContent = '';
    $('#reportTable').innerHTML = '';
    $('#exportExcel').disabled = true;
    $('#exportPdf').disabled = true;

    // Carga (una sola vez) las listas de los filtros que apuntan a otro recurso
    for (const filter of report.filtros.filter((item) => item.recurso)) {
        if (!state.options[filter.recurso]) {
            try { state.options[filter.recurso] = await apiRequest(filter.recurso); } catch { state.options[filter.recurso] = []; }
        }
    }

    $('#reportFilters').innerHTML = report.filtros.map((filter) => {
        const id = `filter-${filter.nombre}`;
        const required = filter.requerido ? 'required' : '';
        const label = `<label for="${id}">${escapeHtml(filter.etiqueta)}${filter.requerido ? ' *' : ''}</label>`;
        if (filter.opciones || filter.recurso) {
            const options = filter.opciones
                ? filter.opciones.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
                : (state.options[filter.recurso] || []).map((item) => `<option value="${escapeHtml(optionId(filter.recurso, item))}">${escapeHtml(optionLabel(filter.recurso, item))}</option>`);
            return `<div class="form-field">${label}<select id="${id}" name="${escapeHtml(filter.nombre)}" ${required}><option value="">${filter.requerido ? 'Selecciona una opción' : escapeHtml(filter.vacio || 'Todos')}</option>${options.join('')}</select></div>`;
        }
        const type = filter.tipo === 'fecha' ? 'date' : (filter.tipo === 'entero' ? 'number' : 'text');
        return `<div class="form-field">${label}<input id="${id}" name="${escapeHtml(filter.nombre)}" type="${type}" ${type === 'number' ? 'min="0" step="1"' : ''} ${required}></div>`;
    }).join('');
    $('#reportForm').classList.remove('hidden');

    // Los reportes sin filtro obligatorio se generan de una vez
    if (!report.filtros.some((filter) => filter.requerido)) runReport();
}

function isNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
}

function formatCell(value, column) {
    if (value === null || value === undefined || value === '') return '—';
    if (isNumber(value)) {
        const decimals = Number.isInteger(value) && !/\(Q\)|%|kg|°C/.test(column) ? 0 : 2;
        return value.toLocaleString('es-GT', { minimumFractionDigits: decimals, maximumFractionDigits: 2 });
    }
    return String(value);
}

// Columnas que tiene sentido totalizar (cantidades y montos, no promedios ni porcentajes)
function isSummable(column, rows) {
    if (/promedio|%|restantes|Peso|Temperatura/i.test(column)) return false;
    return rows.length > 0 && rows.every((row) => row[column] === null || isNumber(row[column]));
}

function totalsRow(result) {
    const totals = {};
    let any = false;
    result.columnas.forEach((column) => {
        if (isSummable(column, result.filas)) {
            totals[column] = result.filas.reduce((sum, row) => sum + (row[column] || 0), 0);
            any = true;
        }
    });
    return any ? totals : null;
}

function renderResult() {
    const result = state.result;
    const container = $('#reportTable');
    const filters = result.filtros.length ? result.filtros.map((filter) => `${filter.etiqueta}: ${filter.valor}`).join(' · ') : 'Sin filtros';
    $('#reportSummary').textContent = `${result.filas.length} fila${result.filas.length === 1 ? '' : 's'} · ${filters}`;
    $('#exportExcel').disabled = result.filas.length === 0;
    $('#exportPdf').disabled = result.filas.length === 0;
    if (!result.filas.length) {
        container.innerHTML = '<div class="empty-state"><span>⌁</span><h3>Sin resultados</h3><p>No hay datos para los filtros elegidos.</p></div>';
        return;
    }
    const numeric = Object.fromEntries(result.columnas.map((column) => [column, result.filas.some((row) => isNumber(row[column]))]));
    const head = result.columnas.map((column) => `<th class="${numeric[column] ? 'num' : ''}">${escapeHtml(column)}</th>`).join('');
    const body = result.filas.map((row) => `<tr>${result.columnas.map((column) => `<td class="${numeric[column] ? 'num' : ''}">${escapeHtml(formatCell(row[column], column))}</td>`).join('')}</tr>`).join('');
    const totals = totalsRow(result);
    const foot = totals ? `<tfoot><tr>${result.columnas.map((column, index) => `<td class="${numeric[column] ? 'num' : ''}">${index === 0 && totals[column] === undefined ? 'Total' : (totals[column] !== undefined ? escapeHtml(formatCell(totals[column], column)) : '')}</td>`).join('')}</tr></tfoot>` : '';
    container.innerHTML = `<table class="report-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody>${foot}</table>`;
}

async function runReport(event) {
    if (event) event.preventDefault();
    const form = $('#reportForm');
    if (!state.current || !form.reportValidity()) return;
    const params = new URLSearchParams();
    state.current.filtros.forEach((filter) => {
        const value = form.elements[filter.nombre]?.value;
        if (value !== undefined && value !== '') params.set(filter.nombre, value);
    });
    $('#reportTable').innerHTML = '<div class="loading-state"><span class="spinner"></span><p>Generando reporte…</p></div>';
    try {
        const query = params.toString();
        state.result = await apiRequest(`reportes/${state.current.clave}${query ? `?${query}` : ''}`);
        renderResult();
    } catch (error) {
        state.result = null;
        $('#reportTable').innerHTML = `<div class="empty-state error-state"><span>!</span><h3>No se pudo generar el reporte</h3><p>${escapeHtml(error.message)}</p></div>`;
        $('#exportExcel').disabled = true;
        $('#exportPdf').disabled = true;
    }
}

function fileName(extension) {
    const today = new Date();
    const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return `${state.result.clave}_${stamp}.${extension}`;
}

function filtersText() {
    return state.result.filtros.length ? state.result.filtros.map((filter) => `${filter.etiqueta}: ${filter.valor}`).join('   ') : 'Sin filtros';
}

function generatedText() {
    return `Generado el ${new Date(state.result.generado).toLocaleString('es-GT')}`;
}

// ---- Excel: los números viajan como números, para poder sumar y filtrar en la hoja
function exportExcel() {
    const result = state.result;
    if (!result?.filas.length) return;
    const totals = totalsRow(result);
    const header = [['Veterinaria Sonrisas'], [result.titulo], [filtersText()], [generatedText()], []];
    const rows = result.filas.map((row) => result.columnas.map((column) => row[column] ?? ''));
    const data = [...header, result.columnas, ...rows];
    if (totals) data.push(result.columnas.map((column, index) => (totals[column] !== undefined ? Math.round(totals[column] * 100) / 100 : (index === 0 ? 'Total' : ''))));
    const sheet = XLSX.utils.aoa_to_sheet(data);
    sheet['!cols'] = result.columnas.map((column) => ({
        wch: Math.min(48, Math.max(column.length, ...result.filas.map((row) => String(row[column] ?? '').length)) + 2),
    }));
    sheet['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: header.length, c: 0 }, e: { r: header.length + rows.length, c: result.columnas.length - 1 } }) };
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Reporte');
    XLSX.writeFile(book, fileName('xlsx'));
    showToast('Reporte exportado a Excel.');
}

// ---- PDF: encabezado, filtros, tabla con totales y número de página
function exportPdf() {
    const result = state.result;
    if (!result?.filas.length) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: result.columnas.length > 5 ? 'landscape' : 'portrait', unit: 'pt', format: 'letter' });
    const totals = totalsRow(result);
    const numeric = result.columnas.map((column) => result.filas.some((row) => isNumber(row[column])));

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(23, 50, 77);
    doc.text('Veterinaria Sonrisas', 40, 42);
    doc.setFontSize(12);
    doc.text(result.titulo, 40, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(90, 105, 115);
    doc.text(filtersText(), 40, 75);
    doc.text(`${generatedText()}   ·   ${result.filas.length} filas`, 40, 88);

    doc.autoTable({
        startY: 100,
        head: [result.columnas],
        body: result.filas.map((row) => result.columnas.map((column) => formatCell(row[column], column))),
        foot: totals ? [result.columnas.map((column, index) => (totals[column] !== undefined ? formatCell(totals[column], column) : (index === 0 ? 'Total' : '')))] : undefined,
        showFoot: 'lastPage',
        styles: { font: 'helvetica', fontSize: 8, cellPadding: 4, overflow: 'linebreak' },
        headStyles: { fillColor: [23, 50, 77], textColor: 255, fontStyle: 'bold' },
        footStyles: { fillColor: [228, 242, 229], textColor: [23, 50, 77], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [247, 250, 249] },
        columnStyles: Object.fromEntries(numeric.map((value, index) => [index, value ? { halign: 'right' } : {}])),
        margin: { left: 40, right: 40 },
        didDrawPage: () => {
            const page = doc.internal.pageSize;
            doc.setFontSize(8);
            doc.setTextColor(120, 144, 156);
            doc.text(`Página ${doc.internal.getNumberOfPages()}`, page.getWidth() - 40, page.getHeight() - 20, { align: 'right' });
        },
    });
    doc.save(fileName('pdf'));
    showToast('Reporte exportado a PDF.');
}

document.addEventListener('DOMContentLoaded', async () => {
    $('#apiBase').value = API_BASE;
    $('#reportMenu').addEventListener('click', (event) => {
        const button = event.target.closest('[data-report]');
        if (button) selectReport(button.dataset.report);
    });
    $('#reportForm').addEventListener('submit', runReport);
    $('#exportExcel').addEventListener('click', exportExcel);
    $('#exportPdf').addEventListener('click', exportPdf);
    try {
        state.catalog = await apiRequest('reportes');
        $('#connectionStatus').className = 'status-dot connected';
        renderMenu();
        if (state.catalog.length) selectReport(state.catalog[0].clave);
    } catch (error) {
        $('#connectionStatus').className = 'status-dot disconnected';
        $('#reportMenu').innerHTML = `<div class="empty-state error-state"><span>!</span><h3>Sin conexión</h3><p>${escapeHtml(error.message)}. Verifica que el backend esté encendido.</p></div>`;
    }
});
