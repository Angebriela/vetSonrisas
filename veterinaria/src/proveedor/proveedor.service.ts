import { Injectable, NotFoundException } from '@nestjs/common';

import { ProveedorRepository } from './entities/proveedor.repository.js';
import { CreateProveedorDto } from './dto/create-proveedor.dto.js';
import { UpdateProveedorDto } from './dto/update-proveedor.dto.js';

@Injectable()
export class ProveedorService {
  constructor(private readonly repository: ProveedorRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('Proveedor no encontrado');
    }
    return record;
  }

  create(dto: CreateProveedorDto) {
    return this.repository.create(dto);
  }

  async update(id: number, dto: UpdateProveedorDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
    return { mensaje: 'Proveedor eliminado correctamente' };
  }
}
