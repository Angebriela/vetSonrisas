import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RegVacuna } from './regvacunas.entity.js';
import { CreateRegVacunaDto } from '../dto/create-regvacunas.dto.js';
import { UpdateRegVacunaDto } from '../dto/update-regvacunas.dto.js';

@Injectable()
export class RegVacunaRepository {
  constructor(
    @InjectRepository(RegVacuna)
    private readonly repository: Repository<RegVacuna>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { paciente: true, detalles: true } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { idRegVacunas: id }, relations: { paciente: true, detalles: true } });
  }

  create(dto: CreateRegVacunaDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  async update(id: number, dto: UpdateRegVacunaDto) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}

