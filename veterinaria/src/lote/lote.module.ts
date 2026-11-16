import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Lote } from './entities/lote.entity.js';
import { LoteRepository } from './entities/lote.repository.js';
import { LoteService } from './lote.service.js';
import { LoteController } from './lote.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Lote])],
  controllers: [LoteController],
  providers: [LoteService, LoteRepository],
  exports: [LoteService],
})
export class LoteModule {}

