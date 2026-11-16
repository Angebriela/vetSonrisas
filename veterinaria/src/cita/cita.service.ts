import { Injectable, NotFoundException } from '@nestjs/common';

import { CitaRepository } from './entities/cita.repository.js';
import { CreateCitaDto } from './dto/create-cita.dto.js';
import { UpdateCitaDto } from './dto/update-cita.dto.js';

@Injectable()
export class CitaService {
  constructor(private readonly repository: CitaRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('Cita no encontrado');
    }
    return record;
  }

  create(dto: CreateCitaDto) {
    return this.repository.create(dto);
  }

  async update(id: number, dto: UpdateCitaDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
    return { mensaje: 'Cita eliminado correctamente' };
  }
}

