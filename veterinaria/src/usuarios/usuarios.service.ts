import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';

import { UsuarioRepository } from './entities/usuario.repository.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import type { UsuarioSesion } from '../auth/usuario-actual.decorator.js';

@Injectable()
export class UsuarioService {
  constructor(
    private readonly repository: UsuarioRepository,
    private readonly dataSource: DataSource,
  ) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return record;
  }

  // Procedimiento almacenado: valida el empleado y el nombre, y cifra con bcrypt
  async create(dto: CreateUsuarioDto) {
    await this.dataSource.query(
      'CALL veterinariasonrisas.sp_crear_usuario($1, $2, $3)',
      [dto.idEmpleado, dto.nombreUsuario, dto.contrasena],
    );
    return this.repository.findByEmpleado(dto.idEmpleado);
  }

  async update(id: number, dto: UpdateUsuarioDto, actual: UsuarioSesion) {
    await this.findById(id);
    if (dto.activo === false) this.validarNoEsElMismo(id, actual);
    if (dto.nombreUsuario !== undefined) dto.nombreUsuario = dto.nombreUsuario.trim();
    if (Object.keys(dto).length === 0) return this.findById(id);

    try {
      return await this.repository.update(id, dto);
    } catch (error) {
      if (error instanceof QueryFailedError && (error as any).driverError?.code === '23505') {
        throw new ConflictException(`El nombre de usuario "${dto.nombreUsuario}" ya está en uso`);
      }
      throw error;
    }
  }

  // Procedimiento almacenado: misma regla de longitud y nuevo hash bcrypt
  async cambiarContrasena(id: number, contrasena: string) {
    await this.dataSource.query(
      'CALL veterinariasonrisas.sp_cambiar_contrasena($1, $2)',
      [id, contrasena],
    );
    return { mensaje: 'Contraseña actualizada correctamente' };
  }

  // No se borra: el usuario queda inactivo y ya no puede iniciar sesión
  async delete(id: number, actual: UsuarioSesion) {
    await this.findById(id);
    this.validarNoEsElMismo(id, actual);
    await this.repository.update(id, { activo: false });
    return { mensaje: 'Usuario desactivado correctamente' };
  }

  // Evita que el administrador se deje a sí mismo sin acceso
  private validarNoEsElMismo(id: number, actual: UsuarioSesion) {
    if (id === actual.idUsuario) {
      throw new BadRequestException('No puedes desactivar tu propio usuario');
    }
  }
}
