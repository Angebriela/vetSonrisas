import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { MedicamentoService } from './medicamento.service.js';
import { CreateMedicamentoDto } from './dto/create-medicamento.dto.js';
import { UpdateMedicamentoDto } from './dto/update-medicamento.dto.js';

@Controller('medicamentos')
export class MedicamentoController {
  constructor(private readonly service: MedicamentoService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateMedicamentoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMedicamentoDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}

