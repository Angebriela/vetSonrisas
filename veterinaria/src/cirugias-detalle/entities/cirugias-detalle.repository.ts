import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CirugiaDetalle } from './cirugias-detalle.entity.js';
import { CreateCirugiaDetalleDto } from '../dto/create-cirugias-detalle.dto.js';
import { UpdateCirugiaDetalleDto } from '../dto/update-cirugias-detalle.dto.js';

@Injectable()
export class CirugiaDetalleRepository {
  constructor(
    @InjectRepository(CirugiaDetalle)
    private readonly repository: Repository<CirugiaDetalle>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { regCirugia: true, lote: true, empleado: true } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { idDetalleCirugia: id }, relations: { regCirugia: true, lote: true, empleado: true } });
  }

  create(dto: CreateCirugiaDetalleDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  async update(id: number, dto: UpdateCirugiaDetalleDto) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}

