import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateVacunaDetalleDto {

  @IsInt()
  @IsNotEmpty()
  idRegVacunas: number;

  @IsInt()
  @IsNotEmpty()
  idLote: number;

  @IsOptional()
  @IsString()
  dosis?: string;

  @IsOptional()
  @IsDateString()
  fechaAdministrada?: string;

  @IsOptional()
  @IsString()
  motivo?: string;

}
