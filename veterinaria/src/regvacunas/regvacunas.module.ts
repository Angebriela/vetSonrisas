import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RegVacuna } from './entities/regvacunas.entity.js';
import { RegVacunaRepository } from './entities/regvacunas.repository.js';
import { RegVacunaService } from './regvacunas.service.js';
import { RegVacunaController } from './regvacunas.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([RegVacuna])],
  controllers: [RegVacunaController],
  providers: [RegVacunaService, RegVacunaRepository],
  exports: [RegVacunaService],
})
export class RegVacunaModule {}

