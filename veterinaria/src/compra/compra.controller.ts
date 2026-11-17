import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { CompraService } from './compra.service.js';
import { CreateCompraDto } from './dto/create-compra.dto.js';
import { UpdateCompraDto } from './dto/update-compra.dto.js';
import { RegistrarLoteDto } from './dto/registrar-lote.dto.js';

@Controller('compras')
export class CompraController {
  constructor(private readonly service: CompraService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateCompraDto) {
    return this.service.create(dto);
  }

  // Agrega un lote a la compra (llama al procedimiento sp_registrar_nuevo_lote)
  @Post(':id/lotes')
  registrarLote(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RegistrarLoteDto,
  ) {
    return this.service.registrarLote(id, dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompraDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
