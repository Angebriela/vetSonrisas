import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Venta } from './venta.entity.js';
import { CreateVentaDto } from '../dto/create-venta.dto.js';
import { UpdateVentaDto } from '../dto/update-venta.dto.js';

@Injectable()
export class VentaRepository {

  constructor(
    @InjectRepository(Venta)
    private readonly repository: Repository<Venta>,
  ) {}

  findAll() {
    return this.repository.find({
      relations: { cliente: true, empleado: true, detalles: true },
    });
  }

  findById(id: number) {
    return this.repository.findOne({
      where: {
        idVenta: id,
      },
      relations: { cliente: true, empleado: true, detalles: true },
    });
  }

  create(dto: CreateVentaDto) {
    const venta = this.repository.create(dto);

    return this.repository.save(venta);
  }

  async update(
    id: number,
    dto: UpdateVentaDto,
  ) {
    await this.repository.update(id, dto);

    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}
