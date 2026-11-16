import { Injectable, NotFoundException } from '@nestjs/common';

import { VacunaDetalleRepository } from './entities/vacunas-detalle.repository.js';
import { CreateVacunaDetalleDto } from './dto/create-vacunas-detalle.dto.js';
import { UpdateVacunaDetalleDto } from './dto/update-vacunas-detalle.dto.js';

@Injectable()
export class VacunaDetalleService {
  constructor(private readonly repository: VacunaDetalleRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('VacunaDetalle no encontrado');
    }
    return record;
  }

  create(dto: CreateVacunaDetalleDto) {
    return this.repository.create(dto);
  }

  async update(id: number, dto: UpdateVacunaDetalleDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
    return { mensaje: 'VacunaDetalle eliminado correctamente' };
  }
}

