import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { NacionalidadService } from './nacionalidad.service.js';
import { CreateNacionalidadDto } from './dto/create-nacionalidad.dto.js';
import { UpdateNacionalidadDto } from './dto/update-nacionalidad.dto.js';

@Controller('nacionalidades')
export class NacionalidadController {
  constructor(private readonly service: NacionalidadService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateNacionalidadDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNacionalidadDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}

