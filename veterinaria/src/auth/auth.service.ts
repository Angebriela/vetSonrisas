import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';

import { LoginDto } from './dto/login.dto.js';
import { permisosDeRol, SIN_ACCESO, tieneAcceso } from './permisos.js';
import type { UsuarioSesion } from './usuario-actual.decorator.js';

interface FilaLogin {
  idusuario: number;
  idempleado: number;
  nombrecompleto: string;
  idrol: number;
  nombrerol: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  // La contraseña se compara dentro de PostgreSQL (fn_validar_login, bcrypt de pgcrypto):
  // el backend nunca ve ni maneja el hash.
  async login(dto: LoginDto) {
    const filas: FilaLogin[] = await this.dataSource.query(
      'SELECT * FROM veterinariasonrisas.fn_validar_login($1, $2)',
      [dto.nombreUsuario, dto.contrasena],
    );
    if (filas.length === 0) {
      // Mismo mensaje si falla el usuario o la contraseña: no revela cuál existe
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const fila = filas[0];
    const usuario: UsuarioSesion = {
      idUsuario: fila.idusuario,
      idEmpleado: fila.idempleado,
      nombreCompleto: fila.nombrecompleto,
      idRol: fila.idrol,
      nombreRol: fila.nombrerol,
    };
    if (!tieneAcceso(permisosDeRol(usuario.nombreRol))) {
      throw new ForbiddenException(SIN_ACCESO);
    }

    const { idUsuario, ...datos } = usuario;
    const token = await this.jwtService.signAsync({ sub: idUsuario, ...datos });
    return { token, ...this.perfil(usuario) };
  }

  perfil(usuario: UsuarioSesion) {
    return {
      usuario: {
        idUsuario: usuario.idUsuario,
        nombreCompleto: usuario.nombreCompleto,
        idRol: usuario.idRol,
        nombreRol: usuario.nombreRol,
      },
      permisos: permisosDeRol(usuario.nombreRol),
    };
  }
}
