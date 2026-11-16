import { PartialType } from '@nestjs/mapped-types';
import { CreateVacunaDetalleDto } from './create-vacunas-detalle.dto.js';

export class UpdateVacunaDetalleDto extends PartialType(CreateVacunaDetalleDto) {}
