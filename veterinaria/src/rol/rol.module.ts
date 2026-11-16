import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Rol } from './entities/rol.entity.js';
import { RolRepository } from './entities/rol.repository.js';
import { RolService } from './rol.service.js';
import { RolController } from './rol.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Rol])],
  controllers: [RolController],
  providers: [RolService, RolRepository],
  exports: [RolService],
})
export class RolModule {}