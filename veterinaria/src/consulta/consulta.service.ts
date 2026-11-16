import { Injectable, NotFoundException } from '@nestjs/common';

import { ConsultaRepository } from './entities/consulta.repository.js';
import { CreateConsultaDto } from './dto/create-consulta.dto.js';
import { UpdateConsultaDto } from './dto/update-consulta.dto.js';

@Injectable()
export class ConsultaService {
  constructor(private readonly repository: ConsultaRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('Consulta no encontrado');
    }
    return record;
  }

  create(dto: CreateConsultaDto) {
    return this.repository.create(dto);
  }

  async update(id: number, dto: UpdateConsultaDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
    return { mensaje: 'Consulta eliminado correctamente' };
  }
}

