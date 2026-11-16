import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Anamnesis } from './entities/anamnesis.entity.js';
import { AnamnesisRepository } from './entities/anamnesis.repository.js';
import { AnamnesisService } from './anamnesis.service.js';
import { AnamnesisController } from './anamnesis.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Anamnesis])],
  controllers: [AnamnesisController],
  providers: [AnamnesisService, AnamnesisRepository],
  exports: [AnamnesisService],
})
export class AnamnesisModule {}

