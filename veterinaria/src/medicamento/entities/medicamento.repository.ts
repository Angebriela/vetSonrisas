import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Medicamento } from './medicamento.entity.js';
import { CreateMedicamentoDto } from '../dto/create-medicamento.dto.js';
import { UpdateMedicamentoDto } from '../dto/update-medicamento.dto.js';

@Injectable()
export class MedicamentoRepository {
  constructor(
    @InjectRepository(Medicamento)
    private readonly repository: Repository<Medicamento>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { lotes: true } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { idMedicamento: id }, relations: { lotes: true } });
  }

  create(dto: CreateMedicamentoDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  async update(id: number, dto: UpdateMedicamentoDto) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}

