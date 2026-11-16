import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cliente } from './cliente.entity.js';
import { CreateClienteDto } from '../dto/create-cliente.dto.js';
import { UpdateClienteDto } from '../dto/update-cliente.dto.js';

@Injectable()
export class ClienteRepository {
  constructor(
    @InjectRepository(Cliente)
    private readonly repository: Repository<Cliente>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { pacientes: true, ventas: true } });
  }

  findById(id: number) {
    return this.repository.findOne({ where: { idCliente: id }, relations: { pacientes: true, ventas: true } });
  }

  create(dto: CreateClienteDto) {
    const record = this.repository.create(dto);
    return this.repository.save(record);
  }

  async update(id: number, dto: UpdateClienteDto) {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}

