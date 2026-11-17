import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CitaRepository } from './entities/cita.repository.js';
import { CreateCitaDto } from './dto/create-cita.dto.js';
import { UpdateCitaDto } from './dto/update-cita.dto.js';
import { IniciarConsultaDto } from './dto/iniciar-consulta.dto.js';

@Injectable()
export class CitaService {
  constructor(
    private readonly repository: CitaRepository,
    private readonly dataSource: DataSource,
  ) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('Cita no encontrado');
    }
    return record;
  }

  create(dto: CreateCitaDto) {
    return this.repository.create(dto);
  }

  async update(id: number, dto: UpdateCitaDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  // Procedimiento almacenado: marca la cita como Atendida y crea la consulta (todo o nada)
  async iniciarConsulta(id: number, dto: IniciarConsultaDto) {
    await this.dataSource.query(
      'CALL veterinariasonrisas.sp_iniciar_consulta($1, $2, $3)',
      [id, dto.idEmpleado, dto.motivoConsulta],
    );
    return this.findById(id);
  }

  // Procedimiento almacenado: cancela la cita si todavía no fue atendida
  async cancelar(id: number) {
    await this.dataSource.query(
      'CALL veterinariasonrisas.sp_cancelar_cita($1)',
      [id],
    );
    return this.findById(id);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
    return { mensaje: 'Cita eliminado correctamente' };
  }
}

