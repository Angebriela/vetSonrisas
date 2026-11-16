import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cita } from './cita.entity.js';
import { CreateCitaDto } from '../dto/create-cita.dto.js';
import { UpdateCitaDto } from '../dto/update-cita.dto.js';

@Injectable()
export class CitaRepository {
  constructor(
    @InjectRepository(Cita)
    private readonly repository: Repository<Cita>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { paciente: true, consultas: true } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { idCita: id }, relations: { paciente: true, consultas: true } });
  }

  create(dto: CreateCitaDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  async update(id: number, dto: UpdateCitaDto) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}

