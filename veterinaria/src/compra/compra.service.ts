import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CompraRepository } from './entities/compra.repository.js';
import { CreateCompraDto } from './dto/create-compra.dto.js';
import { UpdateCompraDto } from './dto/update-compra.dto.js';
import { RegistrarLoteDto } from './dto/registrar-lote.dto.js';

@Injectable()
export class CompraService {
  constructor(
    private readonly repository: CompraRepository,
    private readonly dataSource: DataSource,
  ) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('Compra no encontrada');
    }
    return record;
  }

  async create(dto: CreateCompraDto) {
    const compra = await this.repository.create(dto);
    return this.findById(compra.idCompra);
  }

  async update(id: number, dto: UpdateCompraDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
    return { mensaje: 'Compra eliminada correctamente' };
  }

  // Ingreso de mercadería. El procedimiento crea (o reabastece) el lote y registra
  // el detalle de compra; el trigger trg_stock_compra suma el stock.
  async registrarLote(idCompra: number, dto: RegistrarLoteDto) {
    await this.dataSource.query(
      'CALL veterinariasonrisas.sp_registrar_nuevo_lote($1, $2, $3, $4, $5, $6, $7)',
      [
        idCompra,
        dto.idMedicamento,
        dto.codigoLote,
        dto.fechaCaducidad,
        dto.cantidad,
        dto.precioCosto,
        dto.precioVenta,
      ],
    );
    return this.findById(idCompra);
  }
}
