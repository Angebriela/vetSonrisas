import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Nacionalidad } from './nacionalidad.entity.js';
import { CreateNacionalidadDto } from '../dto/create-nacionalidad.dto.js';
import { UpdateNacionalidadDto } from '../dto/update-nacionalidad.dto.js';

@Injectable()
export class NacionalidadRepository {
  constructor(
    @InjectRepository(Nacionalidad)
    private readonly repository: Repository<Nacionalidad>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { empleados: true } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { idNacionalidad: id }, relations: { empleados: true } });
  }

  create(dto: CreateNacionalidadDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  async update(id: number, dto: UpdateNacionalidadDto) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}

