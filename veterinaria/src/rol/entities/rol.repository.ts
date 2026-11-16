import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Rol } from './rol.entity.js';
import { CreateRolDto } from '../dto/create-rol.dto.js';
import { UpdateRolDto } from '../dto/update-rol.dto.js';

@Injectable()
export class RolRepository {

  constructor(
    @InjectRepository(Rol)
    private readonly repository: Repository<Rol>,
  ) {}

  findAll() {
    return this.repository.find({ relations: { empleados: true } });
  }

  findById(id: number) {
    return this.repository.findOne({
      where: {
        idRol: id,
      },
      relations: { empleados: true },
    });
  }

  create(dto: CreateRolDto) {
    const rol = this.repository.create(dto);

    return this.repository.save(rol);
  }

  async update(
    id: number,
    dto: UpdateRolDto,
  ) {
    await this.repository.update(id, dto);

    return this.findById(id);
  }

  delete(id: number) {
    return this.repository.delete(id);
  }
}
