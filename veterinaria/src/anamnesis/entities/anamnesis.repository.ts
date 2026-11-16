import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Anamnesis } from './anamnesis.entity.js';
import { CreateAnamnesisDto } from '../dto/create-anamnesis.dto.js';
import { UpdateAnamnesisDto } from '../dto/update-anamnesis.dto.js';

@Injectable()
export class AnamnesisRepository {
  constructor(
    @InjectRepository(Anamnesis)
    private readonly repository: Repository<Anamnesis>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { paciente: true } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { noFicha: id }, relations: { paciente: true } });
  }

  create(dto: CreateAnamnesisDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  async update(id: number, dto: UpdateAnamnesisDto) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}

