import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource, EntityManager, In, QueryFailedError } from 'typeorm';

import { VentaRepository } from './entities/venta.repository.js';
import { CreateVentaDto } from './dto/create-venta.dto.js';
import { CreateVentaCompletaDto } from './dto/create-venta-completa.dto.js';
import { UpdateVentaDto } from './dto/update-venta.dto.js';
import { Venta } from './entities/venta.entity.js';
import { VentaDetalle } from '../venta-detalle/entities/venta-detalle.entity.js';
import { Lote } from '../lote/entities/lote.entity.js';
import { Cliente } from '../cliente/entities/cliente.entity.js';

@Injectable()
export class VentaService {

  constructor(
    private readonly ventasRepository: VentaRepository,
    private readonly dataSource: DataSource,
  ) {}

  findAll() {
    return this.ventasRepository.findAll();
  }

  async findById(id: number) {

    const venta =
      await this.ventasRepository.findById(id);

    if (!venta) {
      throw new NotFoundException(
        'Venta no encontrada',
      );
    }

    return venta;
  }

  async create(dto: CreateVentaDto) {
    try {
      // noFactura no se envía: PostgreSQL lo asigna con la secuencia seq_factura
      const venta = await this.ventasRepository.create(dto);
      return await this.findById(venta.idVenta);
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async createComplete(dto: CreateVentaCompletaDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const ventaRepository = manager.getRepository(Venta);
        const detalleRepository = manager.getRepository(VentaDetalle);
        await this.validateSaleDetails(manager, dto.venta.idCliente, dto.detalles);
        const venta = await ventaRepository.save(ventaRepository.create({
          idCliente: dto.venta.idCliente,
          idEmpleado: dto.venta.idEmpleado,
          fechaVenta: dto.venta.fechaVenta,
          horaVenta: dto.venta.horaVenta,
        }));
        const detalles = dto.detalles.map((detalle) => detalleRepository.create({
          idVenta: venta.idVenta,
          idLote: detalle.idLote,
          cantMedicamento: detalle.cantMedicamento,
          precioVenta: detalle.precioVenta,
        }));
        const savedDetails = await detalleRepository.save(detalles);
        // Se vuelve a leer para devolver el número de factura que generó la base
        const completa = await ventaRepository.findOneOrFail({ where: { idVenta: venta.idVenta } });
        return Object.assign(completa, { detalles: savedDetails });
      });
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async update(
    id: number,
    dto: UpdateVentaDto,
  ) {

    await this.findById(id);
    if (dto.idCliente !== undefined) await this.validateExistingSaleClient(id, dto.idCliente);

    try {
      return await this.ventasRepository.update(
        id,
        dto,
      );
    } catch (error) {
      this.handleDbError(error);
    }
  }

  // Procedimiento almacenado: devuelve el stock a los lotes y marca la factura como Anulada
  async anular(id: number, motivo: string) {
    await this.dataSource.query(
      'CALL veterinariasonrisas.sp_anular_venta($1, $2)',
      [id, motivo],
    );
    return this.findById(id);
  }

  async delete(id: number) {

    await this.findById(id);

    try {
      await this.ventasRepository.delete(id);
    } catch (error) {
      this.handleDbError(error);
    }

    return {
      mensaje: 'Venta eliminada correctamente',
    };
  }

  private handleDbError(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const code = (error as any).driverError?.code;

      if (code === '23505') {
        throw new ConflictException(
          'Ya existe una venta con ese número de factura',
        );
      }

      if (code === '23503') {
        throw new BadRequestException(
          'El cliente o empleado no existe, o la venta tiene detalles asociados',
        );
      }
    }

    throw error;
  }

  private async validateSaleDetails(
    manager: EntityManager,
    clientId: number,
    details: CreateVentaCompletaDto['detalles'],
  ): Promise<void> {
    const lotIds = [...new Set(details.map((detail) => detail.idLote))];
    const lots = await manager.getRepository(Lote).find({
      where: { idLote: In(lotIds) },
      relations: { medicamento: true },
    });
    const lotsById = new Map(lots.map((lot) => [lot.idLote, lot]));
    const requestedByLot = new Map<number, number>();
    const esInterno = await this.isInternalClient(manager, clientId);

    for (const detail of details) {
      const lot = lotsById.get(detail.idLote);
      if (!lot) throw new BadRequestException(`El lote #${detail.idLote} no existe`);
      if (!esInterno && lot.medicamento?.aptoParaVenta !== true) {
        throw new BadRequestException('Este medicamento no es apto para venta al público; solo puede facturarse al cliente interno de la clínica');
      }
      const requested = (requestedByLot.get(detail.idLote) || 0) + detail.cantMedicamento;
      requestedByLot.set(detail.idLote, requested);
      if (requested > Number(lot.stockActual)) {
        throw new BadRequestException(`El lote ${lot.codigoLote} no tiene existencias suficientes`);
      }
    }
  }

  private async validateExistingSaleClient(idVenta: number, clientId: number): Promise<void> {
    if (await this.isInternalClient(this.dataSource.manager, clientId)) return;
    const details = await this.dataSource.getRepository(VentaDetalle)
      .createQueryBuilder('detalle')
      .leftJoinAndSelect('detalle.lote', 'lote')
      .leftJoinAndSelect('lote.medicamento', 'medicamento')
      .where('detalle.idVenta = :idVenta', { idVenta })
      .getMany();
    if (details.some((detail) => detail.lote?.medicamento?.aptoParaVenta !== true)) {
      throw new BadRequestException('No se puede asignar esta venta a otro cliente porque contiene medicamentos no calificados para venta');
    }
  }

  // El cliente interno (la propia clínica) se marca en la base con cliente.esinterno
  private async isInternalClient(manager: EntityManager, clientId: number): Promise<boolean> {
    const cliente = await manager.getRepository(Cliente).findOne({ where: { idCliente: clientId } });
    if (!cliente) throw new BadRequestException('El cliente indicado no existe');
    return cliente.esInterno === true;
  }
}
