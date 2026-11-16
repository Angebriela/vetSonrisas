import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { VacunaDetalleService } from './vacunas-detalle.service.js';
import { CreateVacunaDetalleDto } from './dto/create-vacunas-detalle.dto.js';
import { UpdateVacunaDetalleDto } from './dto/update-vacunas-detalle.dto.js';

@Controller('vacunas-detalle')
export class VacunaDetalleController {
  constructor(private readonly service: VacunaDetalleService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateVacunaDetalleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVacunaDetalleDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}

