import { Injectable, NotFoundException } from '@nestjs/common';

import { MedicamentoRepository } from './entities/medicamento.repository.js';
import { CreateMedicamentoDto } from './dto/create-medicamento.dto.js';
import { UpdateMedicamentoDto } from './dto/update-medicamento.dto.js';

@Injectable()
export class MedicamentoService {
  constructor(private readonly repository: MedicamentoRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('Medicamento no encontrado');
    }
    return record;
  }

  create(dto: CreateMedicamentoDto) {
    return this.repository.create(dto);
  }

  async update(id: number, dto: UpdateMedicamentoDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
    return { mensaje: 'Medicamento eliminado correctamente' };
  }
}

