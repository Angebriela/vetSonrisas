import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ESTADOS_CITA } from '../../common/catalogos.js';

export class CreateCitaDto {

  @IsInt()
  @IsNotEmpty()
  idPaciente: number;

  // Veterinario (empleado) que atenderá la cita
  @IsInt()
  @IsPositive()
  idEmpleado: number;

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
  @IsIn(ESTADOS_CITA)
  estadoCita?: string;

}
