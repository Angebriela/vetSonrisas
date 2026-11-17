import { Controller, Get, Param, Query } from '@nestjs/common';

import { ReportesService } from './reportes.service.js';
import { permisosDeRol } from '../auth/permisos.js';
import { UsuarioActual } from '../auth/usuario-actual.decorator.js';
import type { UsuarioSesion } from '../auth/usuario-actual.decorator.js';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly service: ReportesService) {}

  // GET /reportes -> catálogo de reportes y sus filtros, solo los permitidos para el rol
  @Get()
  listar(@UsuarioActual() usuario: UsuarioSesion) {
    return this.service.listar(permisosDeRol(usuario.nombreRol).reportes);
  }

  // GET /reportes/ventas-por-dia?desde=2026-11-01&hasta=2026-11-30
  // El guard ya comprobó que la clave está permitida para el rol
  @Get(':clave')
  ejecutar(
    @Param('clave') clave: string,
    @Query() query: Record<string, string | undefined>,
  ) {
    return this.service.ejecutar(clave, query);
  }
}
