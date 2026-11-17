import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Compra } from './entities/compra.entity.js';
import { CompraDetalle } from './entities/compra-detalle.entity.js';
import { CompraRepository } from './entities/compra.repository.js';
import { CompraService } from './compra.service.js';
import { CompraController } from './compra.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Compra, CompraDetalle])],
  controllers: [CompraController],
  providers: [CompraService, CompraRepository],
  exports: [CompraService],
})
export class CompraModule {}
