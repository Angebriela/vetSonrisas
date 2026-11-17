import { Controller, Get, Param, Query } from '@nestjs/common';

import { ReportesService } from './reportes.service.js';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly service: ReportesService) {}

  // GET /reportes -> catálogo de reportes y sus filtros
  @Get()
  listar() {
    return this.service.listar();
  }

  // GET /reportes/ventas-por-dia?desde=2026-11-01&hasta=2026-11-30
  @Get(':clave')
  ejecutar(
    @Param('clave') clave: string,
    @Query() query: Record<string, string | undefined>,
  ) {
    return this.service.ejecutar(clave, query);
  }
}
