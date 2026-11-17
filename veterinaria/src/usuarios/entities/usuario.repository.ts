import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Usuario } from './usuario.entity.js';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto.js';

// Crear y cambiar contraseña van por procedimientos almacenados (usuarios.service.ts):
// el cifrado bcrypt se hace en la base, nunca aquí.
@Injectable()
export class UsuarioRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly repository: Repository<Usuario>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { empleado: { rol: true } }, order: { idUsuario: 'ASC' } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { idUsuario: id }, relations: { empleado: { rol: true } } });
  }

  findByEmpleado(idEmpleado: number) {
    return this.repository.findOne({ where: { idEmpleado }, relations: { empleado: { rol: true } } });
  }

  async update(id: number, dto: UpdateUsuarioDto) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }
}
