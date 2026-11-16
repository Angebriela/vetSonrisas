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

import { VentaDetalleService } from './venta-detalle.service.js';
import { CreateVentaDetalleDto } from './dto/create-venta-detalle.dto.js';
import { UpdateVentaDetalleDto } from './dto/update-venta-detalle.dto.js';

@Controller('venta-detalle')
export class VentaDetalleController {

  constructor(
    private readonly ventaDetalleService: VentaDetalleService,
  ) {}

  @Get()
  findAll() {
    return this.ventaDetalleService.findAll();
  }

  @Get('venta/:idVenta')
  findByVentaId(
    @Param('idVenta', ParseIntPipe) idVenta: number,
  ) {
    return this.ventaDetalleService.findByVentaId(idVenta);
  }

  @Get(':id')
  findById(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ventaDetalleService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateVentaDetalleDto) {
    return this.ventaDetalleService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVentaDetalleDto,
  ) {
    return this.ventaDetalleService.update(id, dto);
  }

  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ventaDetalleService.delete(id);
  }
}