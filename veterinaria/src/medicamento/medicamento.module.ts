import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Medicamento } from './entities/medicamento.entity.js';
import { MedicamentoRepository } from './entities/medicamento.repository.js';
import { MedicamentoService } from './medicamento.service.js';
import { MedicamentoController } from './medicamento.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Medicamento])],
  controllers: [MedicamentoController],
  providers: [MedicamentoService, MedicamentoRepository],
  exports: [MedicamentoService],
})
export class MedicamentoModule {}

