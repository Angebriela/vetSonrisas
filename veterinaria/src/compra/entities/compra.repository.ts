import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Compra } from './compra.entity.js';
import { CreateCompraDto } from '../dto/create-compra.dto.js';
import { UpdateCompraDto } from '../dto/update-compra.dto.js';

const RELATIONS = {
  proveedor: true,
  empleado: true,
  detalles: { lote: { medicamento: true } },
} as const;

@Injectable()
export class CompraRepository {
  constructor(
    @InjectRepository(Compra)
    private readonly repository: Repository<Compra>,
  ) {}

  findAll() {
    return this.repository.find({ relations: RELATIONS, order: { idCompra: 'DESC' } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { idCompra: id }, relations: RELATIONS });
  }

  create(dto: CreateCompraDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  async update(id: number, dto: UpdateCompraDto) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}
