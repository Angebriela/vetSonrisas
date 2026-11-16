import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Venta } from './entities/venta.entity.js';
import { VentaRepository } from './entities/venta.repository.js';
import { VentaService } from './venta.service.js';
import { VentaController } from './venta.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Venta])],
  controllers: [VentaController],
  providers: [VentaService, VentaRepository],
  exports: [VentaService],
})
export class VentaModule {}

