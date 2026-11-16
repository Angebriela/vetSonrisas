import { Injectable, NotFoundException } from '@nestjs/common';

import { PacienteRepository } from './entities/paciente.repository.js';
import { CreatePacienteDto } from './dto/create-paciente.dto.js';
import { UpdatePacienteDto } from './dto/update-paciente.dto.js';

@Injectable()
export class PacienteService {
  constructor(private readonly repository: PacienteRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('Paciente no encontrado');
    }
    return record;
  }

  create(dto: CreatePacienteDto) {
    return this.repository.create(dto);
  }

  async update(id: number, dto: UpdatePacienteDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
    return { mensaje: 'Paciente eliminado correctamente' };
  }
}

