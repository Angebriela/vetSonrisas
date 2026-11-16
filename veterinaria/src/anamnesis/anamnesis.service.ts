import { Injectable, NotFoundException } from '@nestjs/common';

import { AnamnesisRepository } from './entities/anamnesis.repository.js';
import { CreateAnamnesisDto } from './dto/create-anamnesis.dto.js';
import { UpdateAnamnesisDto } from './dto/update-anamnesis.dto.js';

@Injectable()
export class AnamnesisService {
  constructor(private readonly repository: AnamnesisRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('Anamnesis no encontrado');
    }
    return record;
  }

  create(dto: CreateAnamnesisDto) {
    return this.repository.create(dto);
  }

  async update(id: number, dto: UpdateAnamnesisDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
    return { mensaje: 'Anamnesis eliminado correctamente' };
  }
}

