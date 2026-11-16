import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VentaDetalle } from './entities/venta-detalle.entity.js';
import { VentaDetalleRepository } from './entities/venta-detalle.repository.js';
import { VentaDetalleService } from './venta-detalle.service.js';
import { VentaDetalleController } from './venta-detalle.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([VentaDetalle])],
  controllers: [VentaDetalleController],
  providers: [VentaDetalleService, VentaDetalleRepository],
  exports: [VentaDetalleService],
})
export class VentaDetalleModule {}