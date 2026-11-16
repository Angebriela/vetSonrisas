import { Injectable, NotFoundException } from '@nestjs/common';

import { RegCirugiaRepository } from './entities/regcirugias.repository.js';
import { CreateRegCirugiaDto } from './dto/create-regcirugias.dto.js';
import { UpdateRegCirugiaDto } from './dto/update-regcirugias.dto.js';

@Injectable()
export class RegCirugiaService {
  constructor(private readonly repository: RegCirugiaRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('RegCirugia no encontrado');
    }
    return record;
  }

  create(dto: CreateRegCirugiaDto) {
    return this.repository.create(dto);
  }

  async update(id: number, dto: UpdateRegCirugiaDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
    return { mensaje: 'RegCirugia eliminado correctamente' };
  }
}

