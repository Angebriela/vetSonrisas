import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { PRESENTACIONES, TIPOS_MEDICAMENTO, VIAS_ADMINISTRACION } from '../../common/catalogos.js';

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
  @IsIn(TIPOS_MEDICAMENTO)
  tipoMedicamento?: string;

  @IsOptional()
  @IsIn(VIAS_ADMINISTRACION)
  viaAdministracion?: string;

  @IsOptional()
  @IsIn(PRESENTACIONES)
  presentacion?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  aptoParaVenta?: boolean;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  usoClinico?: boolean;

}
