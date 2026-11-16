import { PartialType } from '@nestjs/mapped-types';
import { CreateRegCirugiaDto } from './create-regcirugias.dto.js';

export class UpdateRegCirugiaDto extends PartialType(CreateRegCirugiaDto) {}
