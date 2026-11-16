import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { RegVacunaService } from './regvacunas.service.js';
import { CreateRegVacunaDto } from './dto/create-regvacunas.dto.js';
import { UpdateRegVacunaDto } from './dto/update-regvacunas.dto.js';

@Controller('regvacunas')
export class RegVacunaController {
  constructor(private readonly service: RegVacunaService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateRegVacunaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRegVacunaDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}

