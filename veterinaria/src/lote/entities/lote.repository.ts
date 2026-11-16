import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Lote } from './lote.entity.js';
import { CreateLoteDto } from '../dto/create-lote.dto.js';
import { UpdateLoteDto } from '../dto/update-lote.dto.js';

@Injectable()
export class LoteRepository {
  constructor(
    @InjectRepository(Lote)
    private readonly repository: Repository<Lote>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { medicamento: true, vacunasDetalles: true, cirugiasDetalles: true, ventaDetalles: true } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { idLote: id }, relations: { medicamento: true, vacunasDetalles: true, cirugiasDetalles: true, ventaDetalles: true } });
  }

  create(dto: CreateLoteDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  async update(id: number, dto: UpdateLoteDto) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}

