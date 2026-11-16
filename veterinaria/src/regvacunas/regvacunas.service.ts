import { Injectable, NotFoundException } from '@nestjs/common';

import { RegVacunaRepository } from './entities/regvacunas.repository.js';
import { CreateRegVacunaDto } from './dto/create-regvacunas.dto.js';
import { UpdateRegVacunaDto } from './dto/update-regvacunas.dto.js';

@Injectable()
export class RegVacunaService {
  constructor(private readonly repository: RegVacunaRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('RegVacuna no encontrado');
    }
    return record;
  }

  create(dto: CreateRegVacunaDto) {
    return this.repository.create(dto);
  }

  async update(id: number, dto: UpdateRegVacunaDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
    return { mensaje: 'RegVacuna eliminado correctamente' };
  }
}

