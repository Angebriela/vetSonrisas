import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VacunaDetalle } from './entities/vacunas-detalle.entity.js';
import { VacunaDetalleRepository } from './entities/vacunas-detalle.repository.js';
import { VacunaDetalleService } from './vacunas-detalle.service.js';
import { VacunaDetalleController } from './vacunas-detalle.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([VacunaDetalle])],
  controllers: [VacunaDetalleController],
  providers: [VacunaDetalleService, VacunaDetalleRepository],
  exports: [VacunaDetalleService],
})
export class VacunaDetalleModule {}

