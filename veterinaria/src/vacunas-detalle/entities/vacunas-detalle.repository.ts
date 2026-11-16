import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VacunaDetalle } from './vacunas-detalle.entity.js';
import { CreateVacunaDetalleDto } from '../dto/create-vacunas-detalle.dto.js';
import { UpdateVacunaDetalleDto } from '../dto/update-vacunas-detalle.dto.js';

@Injectable()
export class VacunaDetalleRepository {
  constructor(
    @InjectRepository(VacunaDetalle)
    private readonly repository: Repository<VacunaDetalle>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { regVacunas: true, lote: true } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { idDetalleVacuna: id }, relations: { regVacunas: true, lote: true } });
  }

  create(dto: CreateVacunaDetalleDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  async update(id: number, dto: UpdateVacunaDetalleDto) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}

