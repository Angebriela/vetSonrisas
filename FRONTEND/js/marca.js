// ---------------------------------------------------------------------------
// Marca de Veterinaria Sonrisas para los documentos descargados.
// Un solo lugar para el logo, los datos de la clínica, los colores y los estilos
// del PDF (jsPDF + autotable) y del Excel (ExcelJS). reportes.js (reportes) y
// app.js (comprobante de venta) usan solo estas funciones.
//
// Es un script clásico (no un módulo) porque las páginas se abren con file:// y
// reportes.js también es clásico. Requiere cargar antes ../js/marca-logo.js.
// ---------------------------------------------------------------------------
(function () {
    const CLINICA = {
        nombre: 'Veterinaria Sonrisas',
        lema: 'Clínica hospitalaria veterinaria',
        direccion: '6ta Calle zona 9, Quetzaltenango',
        telefono: '3467-5633',
        nit: '21194-NER',
        correo: 'vetsonrisas@gmail.com',
    };

    // ---- Colores: se leen de :root en styles.css (ya cargado en la página).
    // La copia de respaldo tiene los mismos valores y solo se usa si la hoja no cargó.
    const RESPALDO = {
        navy: '#17324d', 'navy-soft': '#244c69', aqua: '#43c4d8', mint: '#e4f2e5',
        white: '#ffffff', ink: '#1e2f3c', muted: '#78909c', line: '#e4eaec', danger: '#d85d68',
    };

    function leerVariable(nombre) {
        let valor = getComputedStyle(document.documentElement).getPropertyValue(`--${nombre}`).trim().toLowerCase();
        if (/^#[0-9a-f]{3}$/.test(valor)) valor = `#${[...valor.slice(1)].map((c) => c + c).join('')}`;
        return /^#[0-9a-f]{6}$/.test(valor) ? valor : RESPALDO[nombre];
    }

    const hexARgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    // Tono suave = el mismo color mezclado con blanco (no se inventan colores nuevos)
    const aclarar = (rgb, cantidad) => rgb.map((c) => Math.round(c + (255 - c) * cantidad));
    const rgbAHex = (rgb) => rgb.map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase();

    // Roles de color en los documentos (RGB para jsPDF)
    function colores() {
        const rgb = (nombre) => hexARgb(leerVariable(nombre));
        return {
            principal: rgb('navy'),          // banda del membrete, encabezado de tablas, títulos
            secundario: rgb('navy-soft'),    // lema, subtítulos, borde de totales
            acento: rgb('aqua'),             // filete bajo la banda
            suave: rgb('mint'),              // fila de totales, caja del TOTAL
            alterna: aclarar(rgb('mint'), 0.55), // filas alternas
            texto: rgb('ink'),               // texto de las celdas
            tenue: rgb('muted'),             // contactos, filtros, pie
            linea: rgb('line'),              // bordes finos
            blanco: rgb('white'),
            peligro: rgb('danger'),          // aviso de venta anulada
            marcaAgua: aclarar(rgb('muted'), 0.8), // "ANULADA" en gris suave
        };
    }

    const logo = () => window.MARCA_LOGO;

    // =====================================================================
    // PDF
    // =====================================================================
    const MARGEN = 40;
    const ALIAS_TOTAL = '{total_pages_count_string}';
    const ancho = (doc) => doc.internal.pageSize.getWidth();
    const alto = (doc) => doc.internal.pageSize.getHeight();

    function fuente(doc, estilo, tamano, color) {
        doc.setFont('helvetica', estilo);
        doc.setFontSize(tamano);
        doc.setTextColor(...color);
    }

    function dibujarLogo(doc, x, y, altoLogo) {
        const datos = logo();
        if (!datos) return 0;
        const anchoLogo = altoLogo * datos.ancho / datos.alto;
        doc.addImage(datos.base64, 'PNG', x, y, anchoLogo, altoLogo, 'marca-logo', 'FAST');
        return anchoLogo;
    }

    // Membrete completo de la primera página. Devuelve la Y donde empieza el contenido.
    function encabezado(doc, { titulo = '', subtitulo = '', destacado = '', lineasInfo = [] } = {}) {
        const c = colores();
        const W = ancho(doc);
        const top = 30;
        const anchoLogo = dibujarLogo(doc, MARGEN, top, 54);
        const x = MARGEN + anchoLogo + 12;

        fuente(doc, 'bold', 15, c.principal);
        doc.text(CLINICA.nombre, x, top + 15);
        fuente(doc, 'normal', 8.5, c.secundario);
        doc.text(CLINICA.lema, x, top + 27);
        fuente(doc, 'normal', 7.5, c.tenue);
        doc.text(CLINICA.direccion, x, top + 38);
        doc.text(`Tel. ${CLINICA.telefono}     NIT ${CLINICA.nit}`, x, top + 47);
        doc.text(CLINICA.correo, x, top + 56);

        // Título del documento a la derecha
        const derecha = W - MARGEN;
        const anchoTitulo = W * 0.42;
        fuente(doc, 'bold', 12.5, c.principal);
        const lineasTitulo = doc.splitTextToSize(titulo, anchoTitulo);
        doc.text(lineasTitulo, derecha, top + 15, { align: 'right' });
        let yDerecha = top + 15 + (lineasTitulo.length - 1) * 14;
        if (destacado) {
            fuente(doc, 'bold', 17, c.principal);
            doc.text(destacado, derecha, yDerecha + 20, { align: 'right' });
            yDerecha += 20;
        }
        if (subtitulo) {
            fuente(doc, 'normal', 8.5, c.secundario);
            doc.text(subtitulo, derecha, yDerecha + 13, { align: 'right' });
        }

        // Banda con el color principal y filete de acento
        let y = top + 66;
        doc.setFillColor(...c.principal);
        doc.rect(MARGEN, y, W - 2 * MARGEN, 3.2, 'F');
        doc.setFillColor(...c.acento);
        doc.rect(MARGEN, y + 3.2, W - 2 * MARGEN, 0.9, 'F');
        y += 18;

        if (lineasInfo.length) {
            fuente(doc, 'normal', 8, c.tenue);
            lineasInfo.forEach((linea) => {
                const partes = doc.splitTextToSize(linea, W - 2 * MARGEN);
                doc.text(partes, MARGEN, y);
                y += partes.length * 10.5;
            });
            y += 4;
        }
        return y;
    }

    // Membrete compacto para la página 2 en adelante
    function encabezadoContinuacion(doc, titulo = '') {
        const c = colores();
        const W = ancho(doc);
        const anchoLogo = dibujarLogo(doc, MARGEN, 24, 24);
        fuente(doc, 'bold', 9.5, c.principal);
        doc.text(CLINICA.nombre, MARGEN + anchoLogo + 8, 40);
        fuente(doc, 'normal', 8.5, c.secundario);
        doc.text(doc.splitTextToSize(titulo, W * 0.5)[0] || '', W - MARGEN, 40, { align: 'right' });
        doc.setFillColor(...c.principal);
        doc.rect(MARGEN, 54, W - 2 * MARGEN, 1.6, 'F');
    }

    // Pie en todas las páginas. Se llama una vez, al terminar el documento.
    function pie(doc, { notas = [] } = {}) {
        const c = colores();
        const W = ancho(doc);
        const H = alto(doc);
        const total = doc.getNumberOfPages();
        for (let pagina = 1; pagina <= total; pagina += 1) {
            doc.setPage(pagina);
            const y = H - 42;
            doc.setDrawColor(...c.linea);
            doc.setLineWidth(0.6);
            doc.line(MARGEN, y, W - MARGEN, y);
            fuente(doc, 'bold', 8, c.principal);
            doc.text(CLINICA.nombre, MARGEN, y + 13);
            fuente(doc, 'normal', 7, c.tenue);
            doc.text(`Tel. ${CLINICA.telefono}     ${CLINICA.correo}`, MARGEN, y + 23);
            notas.forEach((nota, indice) => {
                fuente(doc, indice === 0 ? 'bold' : 'normal', 7.5, indice === 0 ? c.secundario : c.tenue);
                doc.text(nota, W / 2, y + 13 + indice * 10, { align: 'center' });
            });
            // "Página X de Y": el total se escribe al final con putTotalPages. Se alinea
            // con el ancho del texto ya resuelto para que quede pegado al margen derecho.
            fuente(doc, 'normal', 7.5, c.tenue);
            const anchoTexto = doc.getTextWidth(`Página ${pagina} de ${total}`);
            doc.text(`Página ${pagina} de ${ALIAS_TOTAL}`, W - MARGEN - anchoTexto, y + 13);
        }
        doc.putTotalPages(ALIAS_TOTAL);
    }

    // Marca de agua diagonal (por ejemplo "ANULADA"), centrada en la página
    function marcaAgua(doc, texto) {
        const c = colores();
        const W = ancho(doc);
        const H = alto(doc);
        fuente(doc, 'bold', 110, c.marcaAgua);
        const largo = doc.getTextWidth(texto);
        const angulo = 35 * Math.PI / 180;
        doc.text(texto, W / 2 - Math.cos(angulo) * largo / 2, H / 2 + Math.sin(angulo) * largo / 2, { angle: 35 });
    }

    // Bloque de datos con título y pares etiqueta/valor (comprobante). Devuelve su alto.
    function bloqueDatos(doc, x, y, anchoBloque, titulo, pares) {
        const c = colores();
        const etiqueta = 62;
        let alturaContenido = 0;
        fuente(doc, 'normal', 8.5, c.texto);
        const lineas = pares.map(([nombre, valor]) => {
            const partes = doc.splitTextToSize(String(valor ?? '—'), anchoBloque - etiqueta - 20);
            alturaContenido += partes.length * 11 + 3;
            return [nombre, partes];
        });
        const altoBloque = 30 + alturaContenido;
        doc.setDrawColor(...c.linea);
        doc.setLineWidth(0.8);
        doc.roundedRect(x, y, anchoBloque, altoBloque, 4, 4, 'S');
        doc.setFillColor(...c.principal);
        doc.rect(x, y + 6, 2.2, 14, 'F');
        fuente(doc, 'bold', 9.5, c.principal);
        doc.text(titulo, x + 10, y + 17);
        let yLinea = y + 34;
        lineas.forEach(([nombre, partes]) => {
            fuente(doc, 'bold', 8, c.secundario);
            doc.text(nombre, x + 10, yLinea);
            fuente(doc, 'normal', 8.5, c.texto);
            doc.text(partes, x + 10 + etiqueta, yLinea);
            yLinea += partes.length * 11 + 3;
        });
        return altoBloque;
    }

    // Columnas alineadas a la derecha (números) para columnStyles de autotable
    function alinearDerecha(indices) {
        return Object.fromEntries(indices.map((indice) => [indice, { halign: 'right' }]));
    }

    const marcaPdf = {
        CLINICA, MARGEN,
        // Margen de la tabla: arriba deja sitio al membrete compacto, abajo al pie
        margenTabla: { top: 70, bottom: 58, left: MARGEN, right: MARGEN },
        encabezado, encabezadoContinuacion, pie, marcaAgua, bloqueDatos, alinearDerecha, colores,
    };
    // Estilos compartidos de jspdf-autotable (se calculan al usarlos, con los colores de :root)
    Object.defineProperty(marcaPdf, 'estiloTabla', {
        enumerable: true,
        get() {
            const c = colores();
            return {
                theme: 'plain',
                margin: marcaPdf.margenTabla,
                showHead: 'everyPage',
                showFoot: 'lastPage',
                styles: {
                    font: 'helvetica', fontSize: 8.5, textColor: c.texto, cellPadding: { top: 5, right: 6, bottom: 5, left: 6 },
                    overflow: 'linebreak', valign: 'middle', lineColor: c.linea, lineWidth: { bottom: 0.5 },
                },
                headStyles: { fillColor: c.principal, textColor: c.blanco, fontStyle: 'bold', lineWidth: 0, valign: 'bottom' },
                alternateRowStyles: { fillColor: c.alterna },
                footStyles: { fillColor: c.suave, textColor: c.principal, fontStyle: 'bold', lineColor: c.secundario, lineWidth: { top: 1.2 } },
            };
        },
    });

    // =====================================================================
    // EXCEL (ExcelJS)
    // =====================================================================
    const FUENTE_EXCEL = 'Arial';
    const argb = (rgb) => `FF${rgbAHex(rgb)}`;

    // Formato numérico según el nombre de la columna
    function formatoNumero(columna, valores) {
        if (/\(Q\)/.test(columna)) return '"Q" #,##0.00';
        if (/%/.test(columna)) return '0.0"%"';
        if (/kg/i.test(columna)) return '0.00';
        if (/°C/.test(columna)) return '0.0';
        return valores.every((valor) => Number.isInteger(valor)) ? '#,##0' : '#,##0.00';
    }

    const letraColumna = (numero) => {
        let letra = '';
        for (let n = numero; n > 0; n = Math.floor((n - 1) / 26)) letra = String.fromCharCode(65 + ((n - 1) % 26)) + letra;
        return letra;
    };

    // Hoja completa con la marca. filas: arreglos de valores u objetos con las columnas como llaves.
    // totales: nombres de las columnas que se suman (con =SUM, no con valores fijos).
    function crearHoja(libro, nombre, { titulo = '', lineasInfo = [], columnas = [], filas = [], totales = [] } = {}) {
        const c = colores();
        const n = columnas.length;
        const ultima = Math.max(n, 6); // el membrete ocupa al menos seis columnas
        const datos = filas.map((fila) => (Array.isArray(fila) ? fila : columnas.map((columna) => fila[columna])).map((valor) => (valor === null || valor === undefined ? '' : valor)));
        const hoja = libro.addWorksheet(nombre, { views: [{ showGridLines: false }] });
        const borde = { style: 'thin', color: { argb: argb(c.linea) } };
        const bordes = { top: borde, left: borde, bottom: borde, right: borde };
        const combinar = (fila, texto, fuenteCelda, altura) => {
            hoja.mergeCells(fila, 2, fila, ultima);
            const celda = hoja.getCell(fila, 2);
            celda.value = texto;
            celda.font = { name: FUENTE_EXCEL, ...fuenteCelda };
            celda.alignment = { vertical: 'middle' };
            if (altura) hoja.getRow(fila).height = altura;
        };

        // Membrete: logo en A1 y datos de la clínica a su derecha
        combinar(1, CLINICA.nombre, { size: 16, bold: true, color: { argb: argb(c.principal) } }, 24);
        combinar(2, CLINICA.lema, { size: 10, italic: true, color: { argb: argb(c.secundario) } }, 15);
        combinar(3, `${CLINICA.direccion}     Tel. ${CLINICA.telefono}`, { size: 9, color: { argb: argb(c.tenue) } }, 14);
        combinar(4, `NIT ${CLINICA.nit}     ${CLINICA.correo}`, { size: 9, color: { argb: argb(c.tenue) } }, 14);
        if (logo()) {
            const imagen = libro.addImage({ base64: logo().base64, extension: 'png' });
            hoja.addImage(imagen, { tl: { col: 0.15, row: 0.15 }, ext: { width: 64, height: 64 * logo().alto / logo().ancho }, editAs: 'oneCell' });
        }
        // Banda con el color principal
        hoja.getRow(5).height = 5;
        for (let col = 1; col <= ultima; col += 1) hoja.getCell(5, col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(c.principal) } };
        hoja.getRow(6).height = 6;

        // Título del documento y líneas de información
        let fila = 7;
        hoja.mergeCells(fila, 1, fila, ultima);
        Object.assign(hoja.getCell(fila, 1), { value: titulo, font: { name: FUENTE_EXCEL, size: 14, bold: true, color: { argb: argb(c.principal) } } });
        hoja.getRow(fila).height = 22;
        lineasInfo.forEach((linea) => {
            fila += 1;
            hoja.mergeCells(fila, 1, fila, ultima);
            Object.assign(hoja.getCell(fila, 1), { value: linea, font: { name: FUENTE_EXCEL, size: 9, color: { argb: argb(c.tenue) } } });
        });
        fila += 2;

        // Encabezados de la tabla
        const filaEncabezado = fila;
        const numericas = columnas.map((_, indice) => datos.some((valores) => typeof valores[indice] === 'number'));
        columnas.forEach((columna, indice) => {
            const celda = hoja.getCell(filaEncabezado, indice + 1);
            celda.value = columna;
            celda.font = { name: FUENTE_EXCEL, size: 10, bold: true, color: { argb: argb(c.blanco) } };
            celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(c.principal) } };
            celda.border = bordes;
            celda.alignment = { vertical: 'middle', horizontal: numericas[indice] ? 'right' : 'left', wrapText: true };
        });
        hoja.getRow(filaEncabezado).height = 20;

        // Datos con bordes finos, filas alternas y formato numérico por columna
        const formatos = columnas.map((columna, indice) => (numericas[indice]
            ? formatoNumero(columna, datos.map((valores) => valores[indice]).filter((valor) => typeof valor === 'number'))
            : null));
        datos.forEach((valores, posicion) => {
            const numeroFila = filaEncabezado + 1 + posicion;
            valores.forEach((valor, indice) => {
                const celda = hoja.getCell(numeroFila, indice + 1);
                celda.value = valor;
                celda.font = { name: FUENTE_EXCEL, size: 10, color: { argb: argb(c.texto) } };
                celda.border = bordes;
                celda.alignment = { vertical: 'top', horizontal: numericas[indice] ? 'right' : 'left', wrapText: !numericas[indice] && String(valor).length > 50 };
                if (formatos[indice] && typeof valor === 'number') celda.numFmt = formatos[indice];
                if (posicion % 2 === 1) celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(c.alterna) } };
            });
        });
        const primeraDato = filaEncabezado + 1;
        const ultimaDato = filaEncabezado + datos.length;
        fila = ultimaDato;

        // Totales con fórmulas =SUM(...)
        if (totales.length && datos.length) {
            fila += 1;
            columnas.forEach((columna, indice) => {
                const celda = hoja.getCell(fila, indice + 1);
                if (totales.includes(columna)) {
                    const letra = letraColumna(indice + 1);
                    const suma = datos.reduce((acumulado, valores) => acumulado + (typeof valores[indice] === 'number' ? valores[indice] : 0), 0);
                    celda.value = { formula: `SUM(${letra}${primeraDato}:${letra}${ultimaDato})`, result: suma };
                    celda.numFmt = formatos[indice] || '#,##0.00';
                    celda.alignment = { horizontal: 'right' };
                } else if (indice === 0) {
                    celda.value = 'Total';
                }
                celda.font = { name: FUENTE_EXCEL, size: 10, bold: true, color: { argb: argb(c.principal) } };
                celda.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(c.suave) } };
                celda.border = { ...bordes, top: { style: 'medium', color: { argb: argb(c.secundario) } } };
            });
        }

        // Línea final con los datos de la clínica
        fila += 2;
        hoja.mergeCells(fila, 1, fila, ultima);
        Object.assign(hoja.getCell(fila, 1), {
            value: `${CLINICA.nombre}  |  ${CLINICA.direccion}  |  Tel. ${CLINICA.telefono}  |  ${CLINICA.correo}`,
            font: { name: FUENTE_EXCEL, size: 8, italic: true, color: { argb: argb(c.tenue) } },
        });

        // Ancho de columnas según el contenido (máximo 50); la A deja sitio al logo
        for (let indice = 0; indice < ultima; indice += 1) {
            const largos = [String(columnas[indice] ?? '').length, ...datos.map((valores) => String(valores[indice] ?? '').length)];
            const anchoColumna = Math.min(50, Math.max(10, ...largos) + 2);
            hoja.getColumn(indice + 1).width = indice === 0 ? Math.max(anchoColumna, 13) : anchoColumna;
        }

        // Paneles inmovilizados bajo los encabezados y autofiltro sobre los datos
        hoja.views = [{ state: 'frozen', ySplit: filaEncabezado, showGridLines: false }];
        if (datos.length) hoja.autoFilter = { from: { row: filaEncabezado, column: 1 }, to: { row: ultimaDato, column: n } };

        // Impresión: carta, ajustada al ancho, encabezados repetidos y pie con páginas
        hoja.pageSetup = {
            paperSize: 1, // carta
            orientation: n > 5 ? 'landscape' : 'portrait',
            fitToPage: true, fitToWidth: 1, fitToHeight: 0,
            horizontalCentered: true,
            margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
            printTitlesRow: `${filaEncabezado}:${filaEncabezado}`,
        };
        const escapar = (texto) => String(texto).replace(/&/g, '&&');
        hoja.headerFooter = {
            oddHeader: `&L&"${FUENTE_EXCEL},Bold"&10${escapar(CLINICA.nombre)}&R&"${FUENTE_EXCEL},Regular"&9${escapar(titulo)}`,
            oddFooter: `&L&"${FUENTE_EXCEL},Regular"&8${escapar(CLINICA.nombre)}  Tel. ${escapar(CLINICA.telefono)}&R&"${FUENTE_EXCEL},Regular"&8Página &P de &N`,
        };
        return hoja;
    }

    // Descarga el libro con writeBuffer + Blob + enlace temporal (funciona con file://)
    async function descargar(libro, nombreArchivo) {
        const buffer = await libro.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const enlace = document.createElement('a');
        const url = URL.createObjectURL(blob);
        enlace.href = url;
        enlace.download = nombreArchivo;
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function nuevoLibro() {
        const libro = new window.ExcelJS.Workbook();
        libro.creator = CLINICA.nombre;
        libro.company = CLINICA.nombre;
        libro.created = new Date();
        return libro;
    }

    window.marcaPdf = marcaPdf;
    window.marcaExcel = { crearHoja, descargar, nuevoLibro, formatoNumero };
}());
