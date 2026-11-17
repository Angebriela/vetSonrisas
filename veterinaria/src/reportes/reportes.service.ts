import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { DefinicionReporte, FiltroReporte, REPORTES } from './reportes.definiciones.js';

@Injectable()
export class ReportesService {
  constructor(private readonly dataSource: DataSource) {}

  // Catálogo para que el frontend dibuje el menú y los filtros
  listar(permitidos: string[]) {
    return REPORTES
      .filter((reporte) => permitidos.includes(reporte.clave))
      .map(({ funcion, ...publico }) => publico);
  }

  async ejecutar(clave: string, query: Record<string, string | undefined>) {
    const reporte = REPORTES.find((item) => item.clave === clave);
    if (!reporte) {
      throw new NotFoundException(`No existe el reporte "${clave}"`);
    }

    const parametros = reporte.filtros.map((filtro) => this.leerFiltro(filtro, query[filtro.nombre]));
    const marcadores = parametros.map((_, index) => `$${index + 1}`).join(', ');

    // El nombre de la función sale del catálogo (nunca del usuario) y los valores
    // viajan como parámetros: no hay forma de inyectar SQL desde la URL.
    const filas: Record<string, unknown>[] = await this.dataSource.query(
      `SELECT * FROM veterinariasonrisas.${reporte.funcion}(${marcadores})`,
      parametros,
    );

    return {
      clave: reporte.clave,
      titulo: reporte.titulo,
      descripcion: reporte.descripcion,
      generado: new Date().toISOString(),
      filtros: this.describirFiltros(reporte, parametros),
      columnas: filas.length > 0 ? Object.keys(filas[0]) : [],
      filas,
    };
  }

  private leerFiltro(filtro: FiltroReporte, valor: string | undefined): string | number | null {
    if (valor === undefined || valor.trim() === '') {
      if (filtro.requerido) {
        throw new BadRequestException(`El filtro "${filtro.etiqueta}" es obligatorio`);
      }
      return null;
    }
    const texto = valor.trim();

    if (filtro.tipo === 'fecha') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(texto) || Number.isNaN(Date.parse(texto))) {
        throw new BadRequestException(`"${filtro.etiqueta}" debe ser una fecha con formato AAAA-MM-DD`);
      }
      return texto;
    }
    if (filtro.tipo === 'entero') {
      if (!/^\d{1,9}$/.test(texto)) {
        throw new BadRequestException(`"${filtro.etiqueta}" debe ser un número entero`);
      }
      return Number(texto);
    }
    if (filtro.opciones && !filtro.opciones.includes(texto)) {
      throw new BadRequestException(`"${filtro.etiqueta}" debe ser uno de: ${filtro.opciones.join(', ')}`);
    }
    return texto;
  }

  private describirFiltros(reporte: DefinicionReporte, parametros: (string | number | null)[]) {
    return reporte.filtros
      .map((filtro, index) => ({ etiqueta: filtro.etiqueta, valor: parametros[index] }))
      .filter((filtro) => filtro.valor !== null);
  }
}
