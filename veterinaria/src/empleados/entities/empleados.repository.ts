import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Empleado } from './empleados.entity.js';
import { CreateEmpleadoDto } from '../dto/create-empleados.dto.js';
import { UpdateEmpleadoDto } from '../dto/update-empleados.dto.js';

@Injectable()
export class EmpleadoRepository {
  constructor(
    @InjectRepository(Empleado)
    private readonly repository: Repository<Empleado>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { nacionalidad: true, rol: true, ventas: true, consultas: true } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { idEmpleado: id }, relations: { nacionalidad: true, rol: true, ventas: true, consultas: true } });
  }

  create(dto: CreateEmpleadoDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  async update(id: number, dto: UpdateEmpleadoDto) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}

