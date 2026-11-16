import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RegCirugia } from './regcirugias.entity.js';
import { CreateRegCirugiaDto } from '../dto/create-regcirugias.dto.js';
import { UpdateRegCirugiaDto } from '../dto/update-regcirugias.dto.js';

@Injectable()
export class RegCirugiaRepository {
  constructor(
    @InjectRepository(RegCirugia)
    private readonly repository: Repository<RegCirugia>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { paciente: true, detalles: true } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { idRegCirugias: id }, relations: { paciente: true, detalles: true } });
  }

  create(dto: CreateRegCirugiaDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  async update(id: number, dto: UpdateRegCirugiaDto) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}

