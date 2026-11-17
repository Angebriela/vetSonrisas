import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Proveedor } from './entities/proveedor.entity.js';
import { ProveedorRepository } from './entities/proveedor.repository.js';
import { ProveedorService } from './proveedor.service.js';
import { ProveedorController } from './proveedor.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor])],
  controllers: [ProveedorController],
  providers: [ProveedorService, ProveedorRepository],
  exports: [ProveedorService],
})
export class ProveedorModule {}
