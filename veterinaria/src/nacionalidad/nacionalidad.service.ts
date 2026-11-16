import { Injectable, NotFoundException } from '@nestjs/common';

import { NacionalidadRepository } from './entities/nacionalidad.repository.js';
import { CreateNacionalidadDto } from './dto/create-nacionalidad.dto.js';
import { UpdateNacionalidadDto } from './dto/update-nacionalidad.dto.js';

@Injectable()
export class NacionalidadService {
  constructor(private readonly repository: NacionalidadRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('Nacionalidad no encontrado');
    }
    return record;
  }

  create(dto: CreateNacionalidadDto) {
    return this.repository.create(dto);
  }

  async update(id: number, dto: UpdateNacionalidadDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
    return { mensaje: 'Nacionalidad eliminado correctamente' };
  }
}

