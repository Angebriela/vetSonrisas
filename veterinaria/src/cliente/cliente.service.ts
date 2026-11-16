import { Injectable, NotFoundException } from '@nestjs/common';

import { ClienteRepository } from './entities/cliente.repository.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';

@Injectable()
export class ClienteService {
  constructor(private readonly repository: ClienteRepository) {}

  findAll() {
    return this.repository.findAll();
  }

  async findById(id: number) {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return record;
  }

  create(dto: CreateClienteDto) {
    return this.repository.create(dto);
  }

  async update(id: number, dto: UpdateClienteDto) {
    await this.findById(id);
    return this.repository.update(id, dto);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.repository.delete(id);
    return { mensaje: 'Cliente eliminado correctamente' };
  }
}

