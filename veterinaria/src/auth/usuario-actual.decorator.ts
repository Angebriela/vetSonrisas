import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Datos del usuario que viajan dentro del token
export interface UsuarioSesion {
  idUsuario: number;
  idEmpleado: number;
  nombreCompleto: string;
  idRol: number;
  nombreRol: string;
}

// El guard deja el usuario del token en request.usuario
export const UsuarioActual = createParamDecorator(
  (_data: unknown, context: ExecutionContext): UsuarioSesion =>
    context.switchToHttp().getRequest().usuario,
);
