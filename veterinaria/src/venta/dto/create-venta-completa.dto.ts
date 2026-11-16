import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsInt,
  IsNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator';

import { CreateVentaDto } from './create-venta.dto.js';

export class CreateVentaCompletaDetalleDto {
  @IsInt()
  @IsPositive()
  idLote: number;

  @IsInt()
  @IsPositive()
  cantMedicamento: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  precioVenta: number;
}

export class CreateVentaCompletaDto {
  @ValidateNested()
  @Type(() => CreateVentaDto)
  venta: CreateVentaDto;

  @ValidateNested({ each: true })
  @Type(() => CreateVentaCompletaDetalleDto)
  @ArrayMinSize(1)
  detalles: CreateVentaCompletaDetalleDto[];
}
