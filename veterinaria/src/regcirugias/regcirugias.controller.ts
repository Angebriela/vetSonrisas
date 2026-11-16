import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

import { RegCirugiaService } from './regcirugias.service.js';
import { CreateRegCirugiaDto } from './dto/create-regcirugias.dto.js';
import { UpdateRegCirugiaDto } from './dto/update-regcirugias.dto.js';

@Controller('regcirugias')
export class RegCirugiaController {
  constructor(private readonly service: RegCirugiaService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateRegCirugiaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRegCirugiaDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}

