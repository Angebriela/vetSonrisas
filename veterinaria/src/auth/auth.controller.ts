import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { Public } from './public.decorator.js';
import { UsuarioActual } from './usuario-actual.decorator.js';
import type { UsuarioSesion } from './usuario-actual.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  // POST /auth/login -> { token, usuario, permisos }
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  // GET /auth/perfil -> { usuario, permisos } del dueño del token
  @Get('perfil')
  perfil(@UsuarioActual() usuario: UsuarioSesion) {
    return this.service.perfil(usuario);
  }
}
