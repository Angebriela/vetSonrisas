import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { AnamnesisService } from './anamnesis.service.js';
import { CreateAnamnesisDto } from './dto/create-anamnesis.dto.js';
import { UpdateAnamnesisDto } from './dto/update-anamnesis.dto.js';

@Controller('anamnesis')
export class AnamnesisController {
  constructor(private readonly service: AnamnesisService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateAnamnesisDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAnamnesisDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}

