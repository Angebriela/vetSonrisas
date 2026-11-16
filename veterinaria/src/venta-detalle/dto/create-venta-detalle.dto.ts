import {
  IsInt,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateVentaDetalleDto {

  @IsInt()
  @IsPositive()
  idVenta: number;

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