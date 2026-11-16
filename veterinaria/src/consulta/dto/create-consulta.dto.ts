import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateConsultaDto {

  @IsOptional()
  @IsInt()
  idCita?: number;

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

}
