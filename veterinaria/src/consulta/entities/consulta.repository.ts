import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Consulta } from './consulta.entity.js';
import { CreateConsultaDto } from '../dto/create-consulta.dto.js';
import { UpdateConsultaDto } from '../dto/update-consulta.dto.js';

@Injectable()
export class ConsultaRepository {
  constructor(
    @InjectRepository(Consulta)
    private readonly repository: Repository<Consulta>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { cita: true, empleado: true, paciente: true } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { idConsulta: id }, relations: { cita: true, empleado: true, paciente: true } });
  }

  create(dto: CreateConsultaDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  async update(id: number, dto: UpdateConsultaDto) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}

