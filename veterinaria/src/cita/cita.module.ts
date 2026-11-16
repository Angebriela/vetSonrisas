import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Cita } from './entities/cita.entity.js';
import { CitaRepository } from './entities/cita.repository.js';
import { CitaService } from './cita.service.js';
import { CitaController } from './cita.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Cita])],
  controllers: [CitaController],
  providers: [CitaService, CitaRepository],
  exports: [CitaService],
})
export class CitaModule {}

