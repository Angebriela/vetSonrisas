import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Proveedor } from './proveedor.entity.js';
import { CreateProveedorDto } from '../dto/create-proveedor.dto.js';
import { UpdateProveedorDto } from '../dto/update-proveedor.dto.js';

@Injectable()
export class ProveedorRepository {
  constructor(
    @InjectRepository(Proveedor)
    private readonly repository: Repository<Proveedor>,
  ) {}

  findAll() {
    return this.repository.find({ order: { nombreProveedor: 'ASC' } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { idProveedor: id } });
  }

  create(dto: CreateProveedorDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  async update(id: number, dto: UpdateProveedorDto) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}
