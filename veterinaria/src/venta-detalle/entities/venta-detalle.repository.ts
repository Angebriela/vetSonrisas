import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VentaDetalle } from './venta-detalle.entity.js';
import { CreateVentaDetalleDto } from '../dto/create-venta-detalle.dto.js';
import { UpdateVentaDetalleDto } from '../dto/update-venta-detalle.dto.js';

@Injectable()
export class VentaDetalleRepository {

  constructor(
    @InjectRepository(VentaDetalle)
    private readonly repository: Repository<VentaDetalle>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { venta: true, lote: true } });
  }

  findById(id: number) {
    return this.repository.findOne({
      where: {
        idDetalleVenta: id,
      },
      relations: { venta: true, lote: true },
    });
  }

  findByVentaId(idVenta: number) {
    return this.repository.find({
      where: {
        idVenta,
      },
      relations: { venta: true, lote: true },
    });
  }

  create(dto: CreateVentaDetalleDto) {
    const detalle = this.repository.create(dto);

    return this.repository.save(detalle);
  }

  async update(
    id: number,
    dto: UpdateVentaDetalleDto,
  ) {
    await this.repository.update(id, dto);

    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}
