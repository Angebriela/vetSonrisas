import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateConsultaDto {

  @IsOptional()
  @IsInt()
  idCita?: number;

  // Opcional: si viene idCita, el trigger trg_consulta_paciente toma el paciente de la cita.
  // En una emergencia (sin cita) la base lo exige.
  @IsOptional()
  @IsInt()
  idPaciente?: number;

  @IsInt()
  @IsNotEmpty()
  idEmpleado: number;

  @IsString()
  @IsNotEmpty()
  motivoConsulta: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsDateString()
  fechaConsulta?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  horaConsulta?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  peso?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(30)
  @Max(45)
  temperatura?: number;

  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  tratamiento?: string;

}
