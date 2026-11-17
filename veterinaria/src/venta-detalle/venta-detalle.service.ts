import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource, QueryFailedError } from 'typeorm';

import { VentaDetalleRepository } from './entities/venta-detalle.repository.js';
import { CreateVentaDetalleDto } from './dto/create-venta-detalle.dto.js';
import { UpdateVentaDetalleDto } from './dto/update-venta-detalle.dto.js';
import { Venta } from '../venta/entities/venta.entity.js';
import { Lote } from '../lote/entities/lote.entity.js';
import { Cliente } from '../cliente/entities/cliente.entity.js';

@Injectable()
export class VentaDetalleService {

  constructor(
    private readonly ventaDetalleRepository: VentaDetalleRepository,
    private readonly dataSource: DataSource,
  ) {}

  findAll() {
    return this.ventaDetalleRepository.findAll();
  }

  async findById(id: number) {

    const detalle =
      await this.ventaDetalleRepository.findById(id);

    if (!detalle) {
      throw new NotFoundException(
        'Detalle de venta no encontrado',
      );
    }

    return detalle;
  }

  findByVentaId(idVenta: number) {
    return this.ventaDetalleRepository.findByVentaId(
      idVenta,
    );
  }

  async create(dto: CreateVentaDetalleDto) {
    try {
      await this.validateSaleDetail(dto.idVenta, dto.idLote, dto.cantMedicamento);
      return await this.ventaDetalleRepository.create(dto);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async update(
    id: number,
    dto: UpdateVentaDetalleDto,
  ) {

    const current = await this.findById(id);

    try {
      await this.validateSaleDetail(dto.idVenta ?? current.idVenta, dto.idLote ?? current.idLote);
      return await this.ventaDetalleRepository.update(
        id,
        dto,
      );
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async delete(id: number) {

    await this.findById(id);

    await this.ventaDetalleRepository.delete(id);

    return {
      mensaje: 'Detalle de venta eliminado correctamente',
    };
  }

  private handleDbError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const code = (error as any).driverError?.code;

      if (code === '23503') {
        throw new BadRequestException(
          'La venta o el lote indicado no existe',
        );
      }

      if (code === '23514') {
        throw new BadRequestException(
          'La cantidad debe ser mayor a 0',
        );
      }
    }

    throw error;
  }

  private async validateSaleDetail(idVenta: number, idLote: number, quantity?: number): Promise<void> {
    const [sale, lot] = await Promise.all([
      this.dataSource.getRepository(Venta).findOne({ where: { idVenta } }),
      this.dataSource.getRepository(Lote).findOne({ where: { idLote }, relations: { medicamento: true } }),
    ]);
    if (!sale) throw new BadRequestException('La venta indicada no existe');
    if (!lot) throw new BadRequestException('El lote indicado no existe');
    const cliente = await this.dataSource.getRepository(Cliente).findOne({ where: { idCliente: sale.idCliente } });
    if (cliente?.esInterno !== true && lot.medicamento?.aptoParaVenta !== true) {
      throw new BadRequestException('Este medicamento no es apto para venta al público; solo puede facturarse al cliente interno de la clínica');
    }
    if (quantity !== undefined && Number(lot.stockActual) < quantity) {
      throw new BadRequestException(`El lote ${lot.codigoLote} no tiene existencias suficientes`);
    }
  }
}
