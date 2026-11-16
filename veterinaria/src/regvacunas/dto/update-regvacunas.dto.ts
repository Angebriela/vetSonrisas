import { PartialType } from '@nestjs/mapped-types';
import { CreateRegVacunaDto } from './create-regvacunas.dto.js';

export class UpdateRegVacunaDto extends PartialType(CreateRegVacunaDto) {}
