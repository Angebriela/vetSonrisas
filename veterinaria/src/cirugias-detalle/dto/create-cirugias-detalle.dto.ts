import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  IsOptional,
} from 'class-validator';

export class CreateCirugiaDetalleDto {

  @IsInt()
  @IsNotEmpty()
  idRegCirugia: number;

  @IsInt()
  @IsNotEmpty()
  idLote: number;

  @IsOptional()
  @IsString()
  tipoDeCirugia?: string;

  @IsOptional()
  @IsString()
  nombreCirugia?: string;

  @IsOptional()
  @IsDateString()
  fechaCirugia?: string;

  @IsOptional()
  @IsString()
  motivo?: string;

}
