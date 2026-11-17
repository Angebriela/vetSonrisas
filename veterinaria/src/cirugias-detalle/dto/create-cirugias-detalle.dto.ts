import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
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

  // Cirujano responsable
  @IsInt()
  @IsPositive()
  idEmpleado: number;

  // Unidades del insumo que se descuentan del lote (por defecto 1)
  @IsOptional()
  @IsInt()
  @IsPositive()
  cantidad?: number;

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
