import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateCitaDto {

  @IsInt()
  @IsNotEmpty()
  idPaciente: number;

  @IsOptional()
  @IsString()
  asuntoCita?: string;

  @IsDateString()
  @IsNotEmpty()
  fechaCita: string;

  @IsString()
  @IsNotEmpty()
  horaInicio: string;

  @IsString()
  @IsNotEmpty()
  horaFin: string;

  @IsOptional()
  @IsString()
  estadoCita?: string;

}
