import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Empleado } from './entities/empleados.entity.js';
import { EmpleadoRepository } from './entities/empleados.repository.js';
import { EmpleadoService } from './empleados.service.js';
import { EmpleadoController } from './empleados.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Empleado])],
  controllers: [EmpleadoController],
  providers: [EmpleadoService, EmpleadoRepository],
  exports: [EmpleadoService],
})
export class EmpleadoModule {}

