import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Usuario } from './entities/usuario.entity.js';
import { UsuarioRepository } from './entities/usuario.repository.js';
import { UsuarioService } from './usuarios.service.js';
import { UsuarioController } from './usuarios.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuarioController],
  providers: [UsuarioService, UsuarioRepository],
})
export class UsuarioModule {}
