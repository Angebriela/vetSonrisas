import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants.js';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

import { ES_PUBLICA } from './public.decorator.js';
import { permisosDeRol, puedeAcceder, SIN_PERMISO } from './permisos.js';
import type { UsuarioSesion } from './usuario-actual.decorator.js';

/**
 * Guard global: toda ruta exige token salvo las marcadas con @Public().
 *
 * El rol se guarda en el token al iniciar sesión y no se vuelve a consultar en
 * cada petición. Por eso, si un administrador cambia el rol de un empleado (o
 * desactiva su usuario), el cambio aplica cuando esa persona vuelve a iniciar
 * sesión o cuando vence su token (JWT_EXPIRES_IN, 8 horas).
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const esPublica = this.reflector.getAllAndOverride<boolean>(ES_PUBLICA, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (esPublica) return true;

    const request = context.switchToHttp().getRequest<Request & { usuario?: UsuarioSesion }>();
    const usuario = await this.leerToken(request);
    request.usuario = usuario;

    // El módulo es la ruta del controlador: @Controller('citas') -> 'citas'
    const modulo = this.reflector.get<string>(PATH_METADATA, context.getClass());
    const claveReporte = typeof request.params?.clave === 'string' ? request.params.clave : undefined;
    if (!puedeAcceder(permisosDeRol(usuario.nombreRol), request.method, modulo, claveReporte)) {
      throw new ForbiddenException(SIN_PERMISO);
    }
    return true;
  }

  private async leerToken(request: Request): Promise<UsuarioSesion> {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Debes iniciar sesión');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return {
        idUsuario: payload.sub,
        idEmpleado: payload.idEmpleado,
        nombreCompleto: payload.nombreCompleto,
        idRol: payload.idRol,
        nombreRol: payload.nombreRol,
      };
    } catch {
      throw new UnauthorizedException('La sesión venció o no es válida. Inicia sesión de nuevo');
    }
  }
}
