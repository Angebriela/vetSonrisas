import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { CitaService } from './cita.service.js';
import { CreateCitaDto } from './dto/create-cita.dto.js';
import { UpdateCitaDto } from './dto/update-cita.dto.js';
import { IniciarConsultaDto } from './dto/iniciar-consulta.dto.js';

@Controller('citas')
export class CitaController {
  constructor(private readonly service: CitaService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateCitaDto) {
    return this.service.create(dto);
  }

  @Post(':id/iniciar-consulta')
  iniciarConsulta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: IniciarConsultaDto,
  ) {
    return this.service.iniciarConsulta(id, dto);
  }

  @Post(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.service.cancelar(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCitaDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}

