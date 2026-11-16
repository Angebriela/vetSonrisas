import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RegCirugia } from './entities/regcirugias.entity.js';
import { RegCirugiaRepository } from './entities/regcirugias.repository.js';
import { RegCirugiaService } from './regcirugias.service.js';
import { RegCirugiaController } from './regcirugias.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([RegCirugia])],
  controllers: [RegCirugiaController],
  providers: [RegCirugiaService, RegCirugiaRepository],
  exports: [RegCirugiaService],
})
export class RegCirugiaModule {}

