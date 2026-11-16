import { PartialType } from '@nestjs/mapped-types';
import { CreateNacionalidadDto } from './create-nacionalidad.dto.js';

export class UpdateNacionalidadDto extends PartialType(CreateNacionalidadDto) {}
