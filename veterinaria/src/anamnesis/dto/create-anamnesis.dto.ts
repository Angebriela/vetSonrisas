import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateAnamnesisDto {

  @IsInt()
  @IsNotEmpty()
  idPaciente: number;

  @IsOptional()
  @IsString()
  dieta?: string;

  @IsOptional()
  @IsString()
  enfermedadesPrevias?: string;

  @IsOptional()
  @IsString()
  cirugiasPrevias?: string;

  @IsOptional()
  @IsBoolean()
  esterilizado?: boolean;

  @IsOptional()
  @IsInt()
  noPartos?: number;

  @IsOptional()
  @IsBoolean()
  desparasitada?: boolean;

  @IsOptional()
  @IsBoolean()
  viajesRecientes?: boolean;

  @IsOptional()
  @IsBoolean()
  viveConAnimales?: boolean;

  @IsOptional()
  @IsString()
  comportamiento?: string;

}
