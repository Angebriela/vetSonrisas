
// Reportes · Veterinaria Sonrisas
const API_BASE = (localStorage.getItem('vet_api_base') || 'http://localhost:3000').replace(/\/$/, '');

// Misma sesión que el panel (login.js la guarda en sessionStorage)
const SESSION_TOKEN = 'vet_token';
const SESSION_PROFILE = 'vet_perfil';

// request: número de la última petición; una respuesta vieja nunca pisa a una nueva
const state = { catalog: [], current: null, result: null, options: {}, request: 0 };

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

function logout() {
    sessionStorage.removeItem(SESSION_TOKEN);
    sessionStorage.removeItem(SESSION_PROFILE);
    window.location.replace('login.html');
}

function showUser(perfil) {
    if (!perfil?.usuario) return;
    $('#userName').textContent = perfil.usuario.nombreCompleto;
    $('#userRole').textContent = perfil.usuario.nombreRol;
}

async function apiRequest(path) {
    const token = sessionStorage.getItem(SESSION_TOKEN);
    const response = await fetch(`${API_BASE}/${path}`, { headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
    const text = await response.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    if (response.status === 401) logout(); // sin sesión o token vencido
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

// Bloque de estado (inicial, cargando, vacío, error) dentro de la zona de la tabla
function stateBlock({ mark, title, message, kind = '', role = 'status', extra = '' }) {
    return `<div class="report-state${kind ? ` report-state-${kind}` : ''}" role="${role}">${mark}<h3>${escapeHtml(title)}</h3>${message ? `<p>${escapeHtml(message)}</p>` : ''}${extra}</div>`;
}

// El menú se dibuja dos veces con los mismos datos: como lista agrupada (pantallas
// anchas) y como <select> con grupos (menos de 900 px). El CSS muestra uno u otro.
function renderMenu() {
    const groups = [...new Set(state.catalog.map((report) => report.grupo))];
    const reportsOf = (group) => state.catalog.filter((report) => report.grupo === group);
    const list = groups.map((group, index) => `<div class="report-menu-group" role="group" aria-labelledby="report-group-${index}"><h2 class="report-menu-heading" id="report-group-${index}">${escapeHtml(group)}</h2>${reportsOf(group)
        .map((report) => `<button class="report-item" data-report="${escapeHtml(report.clave)}" type="button">${escapeHtml(report.titulo)}</button>`)
        .join('')}</div>`).join('');
    const options = groups.map((group) => `<optgroup label="${escapeHtml(group)}">${reportsOf(group)
        .map((report) => `<option value="${escapeHtml(report.clave)}">${escapeHtml(report.titulo)}</option>`)
        .join('')}</optgroup>`).join('');
    $('#reportMenu').innerHTML = `<label class="report-picker"><span>Reporte</span><select id="reportPicker">${options}</select></label><nav class="report-list" aria-label="Reportes disponibles">${list}</nav>`;
    markActive();
}

// Marca el reporte activo sin volver a dibujar el menú (así no se pierde el foco)
function markActive() {
    document.querySelectorAll('#reportMenu [data-report]').forEach((button) => {
        if (button.dataset.report === state.current?.clave) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
    });
    const picker = $('#reportPicker');
    if (picker && state.current) picker.value = state.current.clave;
}

async function selectReport(key) {
    const report = state.catalog.find((item) => item.clave === key);
    if (!report) return;
    state.current = report;
    state.result = null;
    state.request += 1; // descarta cualquier reporte anterior que aún no haya respondido
    markActive();
    $('#reportGroup').textContent = report.grupo;
    $('#reportTitle').textContent = report.titulo;
    $('#reportDescription').textContent = report.descripcion;
    $('#reportSummary').innerHTML = '';
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
        const required = filter.requerido ? 'required aria-required="true"' : '';
        const label = `<label for="${id}">${escapeHtml(filter.etiqueta)}${filter.requerido ? ' <span class="report-required">(obligatorio)</span>' : ''}</label>`;
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

    // Los reportes sin filtro obligatorio se generan de una vez; los demás esperan al usuario
    const requiredFilters = report.filtros.filter((filter) => filter.requerido);
    if (!requiredFilters.length) {
        runReport();
        return;
    }
    $('#reportTable').innerHTML = stateBlock({
        mark: '<span class="report-state-mark" aria-hidden="true">?</span>',
        title: `Elige ${requiredFilters.map((filter) => filter.etiqueta.toLowerCase()).join(' y ')} para ver este reporte`,
        message: 'Completa el filtro marcado como obligatorio y pulsa Generar.',
    });
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

// Cómo se dibuja cada columna: números a la derecha; textos largos (más de 32
// caracteres en alguna fila) se cortan en varias líneas; fechas, horas, códigos y
// textos cortos nunca se cortan.
function columnKind(column, rows) {
    if (rows.some((row) => isNumber(row[column]))) return 'num';
    const longest = Math.max(0, ...rows.map((row) => String(row[column] ?? '').length));
    return longest > 32 ? 'text' : 'plain';
}

function cellHtml(kind, value) {
    if (kind === 'text') return `<td><div class="report-cell-text">${value}</div></td>`;
    return `<td${kind === 'num' ? ' class="num"' : ''}>${value}</td>`;
}

// Valor legible de un filtro: fechas como dd/mm/aaaa y los id con el nombre de su lista
function filterValueText(label, value) {
    const filter = state.current?.filtros.find((item) => item.etiqueta === label);
    if (filter?.recurso) {
        const item = (state.options[filter.recurso] || []).find((option) => String(optionId(filter.recurso, option)) === String(value));
        if (item) return optionLabel(filter.recurso, item);
    }
    if (filter?.tipo === 'fecha' && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value).split('-').reverse().join('/');
    return String(value);
}

function renderSummary(result) {
    const count = result.filas.length;
    const chips = result.filtros.length
        ? result.filtros.map((filter) => `<li class="report-chip"><span>${escapeHtml(filter.etiqueta)}:</span> ${escapeHtml(filterValueText(filter.etiqueta, filter.valor))}</li>`).join('')
        : '<li class="report-chip report-chip-empty">Sin filtros</li>';
    $('#reportSummary').innerHTML = `<strong class="report-count">${count.toLocaleString('es-GT')} ${count === 1 ? 'fila' : 'filas'}</strong><ul class="report-chips" aria-label="Filtros aplicados">${chips}</ul><span class="report-generated">${escapeHtml(generatedText())}</span>`;
}

function renderResult() {
    const result = state.result;
    const container = $('#reportTable');
    renderSummary(result);
    $('#exportExcel').disabled = result.filas.length === 0;
    $('#exportPdf').disabled = result.filas.length === 0;
    if (!result.filas.length) {
        container.innerHTML = stateBlock({
            mark: '<span class="report-state-mark" aria-hidden="true">0</span>',
            title: 'Sin resultados para estos filtros',
            message: 'Amplía el rango de fechas o quita algún filtro y vuelve a generar el reporte.',
        });
        return;
    }
    const kinds = Object.fromEntries(result.columnas.map((column) => [column, columnKind(column, result.filas)]));
    const head = result.columnas.map((column) => `<th scope="col"${kinds[column] === 'num' ? ' class="num"' : ''}>${escapeHtml(column)}</th>`).join('');
    const body = result.filas.map((row) => `<tr>${result.columnas.map((column) => cellHtml(kinds[column], escapeHtml(formatCell(row[column], column)))).join('')}</tr>`).join('');
    const totals = totalsRow(result);
    const foot = totals ? `<tfoot><tr>${result.columnas.map((column, index) => `<td${kinds[column] === 'num' ? ' class="num"' : ''}>${index === 0 && totals[column] === undefined ? 'Total' : (totals[column] !== undefined ? escapeHtml(formatCell(totals[column], column)) : '')}</td>`).join('')}</tr></tfoot>` : '';
    // La zona con scroll es enfocable para poder recorrerla con el teclado
    container.innerHTML = `<div class="report-scroll" role="region" aria-label="Tabla del reporte ${escapeHtml(result.titulo)}" tabindex="0"><table class="report-table"><caption class="report-sr-only">${escapeHtml(result.titulo)}: ${result.filas.length} filas</caption><thead><tr>${head}</tr></thead><tbody>${body}</tbody>${foot}</table></div><p class="report-scroll-hint hidden">Desliza la tabla hacia los lados para ver todas las columnas.</p>`;
    updateScrollHint();
}

// El aviso solo aparece cuando la tabla es más ancha que su zona
function updateScrollHint() {
    const scroll = document.querySelector('#reportTable .report-scroll');
    const hint = document.querySelector('#reportTable .report-scroll-hint');
    if (scroll && hint) hint.classList.toggle('hidden', scroll.scrollWidth <= scroll.clientWidth + 1);
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
    $('#reportSummary').innerHTML = '';
    $('#reportTable').innerHTML = stateBlock({ mark: '<span class="spinner" aria-hidden="true"></span>', title: 'Generando reporte…' });
    $('#exportExcel').disabled = true;
    $('#exportPdf').disabled = true;
    const request = ++state.request;
    try {
        const query = params.toString();
        const result = await apiRequest(`reportes/${state.current.clave}${query ? `?${query}` : ''}`);
        if (request !== state.request) return; // llegó tarde: ya se pidió otro reporte
        state.result = result;
        renderResult();
    } catch (error) {
        if (request !== state.request) return;
        state.result = null;
        $('#reportSummary').innerHTML = '';
        // El mensaje del backend se muestra tal cual: explica qué filtro corregir
        $('#reportTable').innerHTML = stateBlock({
            mark: '<span class="report-state-mark" aria-hidden="true">!</span>',
            title: 'No se pudo generar el reporte',
            kind: 'error',
            role: 'alert',
            extra: `<p class="report-error-detail">${escapeHtml(error.message)}</p><button class="button button-secondary" data-report-retry type="button">Reintentar</button>`,
        });
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
    if (!sessionStorage.getItem(SESSION_TOKEN)) {
        window.location.replace('login.html');
        return;
    }
    try { showUser(JSON.parse(sessionStorage.getItem(SESSION_PROFILE))); } catch { /* perfil dañado: se recarga abajo */ }
    $('#logoutButton').addEventListener('click', logout);
    $('#apiBase').value = API_BASE;
    $('#reportMenu').addEventListener('click', (event) => {
        const button = event.target.closest('[data-report]');
        if (button) selectReport(button.dataset.report);
    });
    $('#reportMenu').addEventListener('change', (event) => {
        if (event.target.id === 'reportPicker') selectReport(event.target.value);
    });
    $('#reportTable').addEventListener('click', (event) => {
        if (event.target.closest('[data-report-retry]')) runReport();
    });
    $('#reportForm').addEventListener('submit', runReport);
    window.addEventListener('resize', updateScrollHint);
    $('#exportExcel').addEventListener('click', exportExcel);
    $('#exportPdf').addEventListener('click', exportPdf);
    try {
        const perfil = await apiRequest('auth/perfil');
        sessionStorage.setItem(SESSION_PROFILE, JSON.stringify(perfil));
        showUser(perfil);
        // El backend ya devuelve solo los reportes permitidos para el rol
        state.catalog = await apiRequest('reportes');
        $('#connectionStatus').className = 'status-dot connected';
        renderMenu();
        if (state.catalog.length) selectReport(state.catalog[0].clave);
        else $('#reportTable').innerHTML = stateBlock({ mark: '<span class="report-state-mark" aria-hidden="true">0</span>', title: 'Tu rol no tiene reportes asignados', message: 'Pide al administrador que revise los permisos de tu rol.' });
    } catch (error) {
        if (!sessionStorage.getItem(SESSION_TOKEN)) return; // 401: ya se redirigió al login
        $('#connectionStatus').className = 'status-dot disconnected';
        $('#reportTable').innerHTML = stateBlock({
            mark: '<span class="report-state-mark" aria-hidden="true">!</span>',
            title: `No se pudo conectar con ${API_BASE}`,
            kind: 'error',
            role: 'alert',
            extra: `<p class="report-error-detail">${escapeHtml(error.message)}</p><p>Verifica que el backend esté encendido y recarga la página.</p>`,
        });
    }
});
