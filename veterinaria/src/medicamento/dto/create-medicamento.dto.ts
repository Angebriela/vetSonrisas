import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateMedicamentoDto {

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  nombreMed: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  contenidoNeto?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipoMedicamento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  viaAdministracion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  presentacion?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  aptoParaVenta?: boolean;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  usoClinico?: boolean;

}
