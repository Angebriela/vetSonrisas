import { PartialType } from '@nestjs/mapped-types';
import { CreateAnamnesisDto } from './create-anamnesis.dto.js';

export class UpdateAnamnesisDto extends PartialType(CreateAnamnesisDto) {}
