import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CirugiaDetalle } from './entities/cirugias-detalle.entity.js';
import { CirugiaDetalleRepository } from './entities/cirugias-detalle.repository.js';
import { CirugiaDetalleService } from './cirugias-detalle.service.js';
import { CirugiaDetalleController } from './cirugias-detalle.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([CirugiaDetalle])],
  controllers: [CirugiaDetalleController],
  providers: [CirugiaDetalleService, CirugiaDetalleRepository],
  exports: [CirugiaDetalleService],
})
export class CirugiaDetalleModule {}

