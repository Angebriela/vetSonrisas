import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Nacionalidad } from './entities/nacionalidad.entity.js';
import { NacionalidadRepository } from './entities/nacionalidad.repository.js';
import { NacionalidadService } from './nacionalidad.service.js';
import { NacionalidadController } from './nacionalidad.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Nacionalidad])],
  controllers: [NacionalidadController],
  providers: [NacionalidadService, NacionalidadRepository],
  exports: [NacionalidadService],
})
export class NacionalidadModule {}

