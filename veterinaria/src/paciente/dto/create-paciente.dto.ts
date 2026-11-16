import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreatePacienteDto {

  @IsInt()
  @IsNotEmpty()
  idCliente: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombrePaciente: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  especiePaciente: string;

  @IsOptional()
  @IsString()
  razaPaciente?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[MH]$/, { message: 'El sexo debe ser M (Macho) o H (Hembra)' })
  sexoPaciente?: string;

  @IsOptional()
  @IsString()
  colorPaciente?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsNumber()
  pesoPaciente?: number;

  @IsOptional()
  @IsString()
  tipoPelaje?: string;

  @IsOptional()
  @IsString()
  identificacionesParticulares?: string;

  @IsOptional()
  @IsString()
  finZootecnico?: string;

}
