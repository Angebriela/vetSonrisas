import { PartialType } from '@nestjs/mapped-types';
import { CreateCirugiaDetalleDto } from './create-cirugias-detalle.dto.js';

export class UpdateCirugiaDetalleDto extends PartialType(CreateCirugiaDetalleDto) {}
