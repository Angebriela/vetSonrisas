import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { CirugiaDetalleService } from './cirugias-detalle.service.js';
import { CreateCirugiaDetalleDto } from './dto/create-cirugias-detalle.dto.js';
import { UpdateCirugiaDetalleDto } from './dto/update-cirugias-detalle.dto.js';

@Controller('cirugias-detalle')
export class CirugiaDetalleController {
  constructor(private readonly service: CirugiaDetalleService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateCirugiaDetalleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCirugiaDetalleDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}

