import { Injectable, NotFoundException } from '@nestjs/common';

import { LoteRepository } from './entities/lote.repository.js';
import { CreateLoteDto } from './dto/create-lote.dto.js';
import { UpdateLoteDto } from './dto/update-lote.dto.js';

@Injectable()
export class LoteService {
  constructor(private readonly repository: LoteRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('Lote no encontrado');
    }
    return record;
  }

  create(dto: CreateLoteDto) {
    return this.repository.create(dto);
  }

  async update(id: number, dto: UpdateLoteDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
    return { mensaje: 'Lote eliminado correctamente' };
  }
}

