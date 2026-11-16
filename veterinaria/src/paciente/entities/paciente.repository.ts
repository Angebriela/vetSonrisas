import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Paciente } from './paciente.entity.js';
import { CreatePacienteDto } from '../dto/create-paciente.dto.js';
import { UpdatePacienteDto } from '../dto/update-paciente.dto.js';

@Injectable()
export class PacienteRepository {
  constructor(
    @InjectRepository(Paciente)
    private readonly repository: Repository<Paciente>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { cliente: true, anamnesis: true, citas: true, regVacunas: true, regCirugias: true } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { idPaciente: id }, relations: { cliente: true, anamnesis: true, citas: true, regVacunas: true, regCirugias: true } });
  }

  create(dto: CreatePacienteDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  async update(id: number, dto: UpdatePacienteDto) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}

