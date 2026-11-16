import { Injectable, NotFoundException } from '@nestjs/common';

import { CirugiaDetalleRepository } from './entities/cirugias-detalle.repository.js';
import { CreateCirugiaDetalleDto } from './dto/create-cirugias-detalle.dto.js';
import { UpdateCirugiaDetalleDto } from './dto/update-cirugias-detalle.dto.js';

@Injectable()
export class CirugiaDetalleService {
  constructor(private readonly repository: CirugiaDetalleRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('CirugiaDetalle no encontrado');
    }
    return record;
  }

  create(dto: CreateCirugiaDetalleDto) {
    return this.repository.create(dto);
  }

  async update(id: number, dto: UpdateCirugiaDetalleDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
    return { mensaje: 'CirugiaDetalle eliminado correctamente' };
  }
}

