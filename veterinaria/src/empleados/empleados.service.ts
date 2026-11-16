import { Injectable, NotFoundException } from '@nestjs/common';

import { EmpleadoRepository } from './entities/empleados.repository.js';
import { CreateEmpleadoDto } from './dto/create-empleados.dto.js';
import { UpdateEmpleadoDto } from './dto/update-empleados.dto.js';

@Injectable()
export class EmpleadoService {
  constructor(private readonly repository: EmpleadoRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('Empleado no encontrado');
    }
    return record;
  }

  create(dto: CreateEmpleadoDto) {
    return this.repository.create(dto);
  }

  async update(id: number, dto: UpdateEmpleadoDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
    return { mensaje: 'Empleado eliminado correctamente' };
  }
}

