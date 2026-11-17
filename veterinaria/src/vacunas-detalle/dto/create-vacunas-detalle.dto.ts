import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
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

  // Empleado que aplicó la vacuna
  @IsInt()
  @IsPositive()
  idEmpleado: number;

  // Unidades que se descuentan del lote (por defecto 1)
  @IsOptional()
  @IsInt()
  @IsPositive()
  cantidad?: number;

  @IsOptional()
  @IsString()
  dosis?: string;

  @IsOptional()
  @IsDateString()
  fechaAdministrada?: string;

  @IsOptional()
  @IsDateString()
  proximaDosis?: string;

  @IsOptional()
  @IsString()
  motivo?: string;

}
