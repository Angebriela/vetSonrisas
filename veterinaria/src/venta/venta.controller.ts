import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';

import { VentaService } from './venta.service.js';
import { CreateVentaDto } from './dto/create-venta.dto.js';
import { CreateVentaCompletaDto } from './dto/create-venta-completa.dto.js';
import { UpdateVentaDto } from './dto/update-venta.dto.js';
import { AnularVentaDto } from './dto/anular-venta.dto.js';

@Controller('ventas')
export class VentaController {

  constructor(
    private readonly ventasService: VentaService,
  ) {}

  @Get()
  findAll() {
    return this.ventasService.findAll();
  }

  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ventasService.findById(id);
  }

  @Post('completa')
  createComplete(@Body() dto: CreateVentaCompletaDto) {
    return this.ventasService.createComplete(dto);
  }

  @Post(':id/anular')
  anular(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AnularVentaDto,
  ) {
    return this.ventasService.anular(id, dto.motivo);
  }

  @Post()
  create(@Body() dto: CreateVentaDto) {
    return this.ventasService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVentaDto,
  ) {
    return this.ventasService.update(id, dto);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ventasService.delete(id);
  }
}
