import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { UsuarioService } from './usuarios.service.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto.js';
import { UsuarioActual } from '../auth/usuario-actual.decorator.js';
import type { UsuarioSesion } from '../auth/usuario-actual.decorator.js';

// Todo /usuarios (incluida la lectura) es solo para el Administrador: ver auth/permisos.ts
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly service: UsuarioService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateUsuarioDto) {
    return this.service.create(dto);
  }

  @Post(':id/contrasena')
  @HttpCode(HttpStatus.OK)
  cambiarContrasena(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarContrasenaDto,
  ) {
    return this.service.cambiarContrasena(id, dto.contrasena);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUsuarioDto,
    @UsuarioActual() actual: UsuarioSesion,
  ) {
    return this.service.update(id, dto, actual);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() actual: UsuarioSesion,
  ) {
    return this.service.delete(id, actual);
  }
}
