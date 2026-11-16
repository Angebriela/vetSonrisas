import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { RolRepository } from './entities/rol.repository.js';
import { CreateRolDto } from './dto/create-rol.dto.js';
import { UpdateRolDto } from './dto/update-rol.dto.js';

@Injectable()
export class RolService {

  constructor(
    private readonly rolRepository: RolRepository,
  ) {}

  findAll() {
    return this.rolRepository.findAll();
  }

  async findById(id: number) {

    const rol =
      await this.rolRepository.findById(id);

    if (!rol) {
      throw new NotFoundException(
        'Rol no encontrado',
      );
    }

    return rol;
  }

  create(dto: CreateRolDto) {
    return this.rolRepository.create(dto);
  }

  async update(
    id: number,
    dto: UpdateRolDto,
  ) {

    await this.findById(id);

    return this.rolRepository.update(
      id,
      dto,
    );
  }

  async delete(id: number) {

    await this.findById(id);

    await this.rolRepository.delete(id);

    return {
      mensaje: 'Rol eliminado correctamente',
    };
  }
}