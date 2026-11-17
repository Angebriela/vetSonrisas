import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

// Datos de un lote que entra con una compra (parámetros de sp_registrar_nuevo_lote)
export class RegistrarLoteDto {

  @IsInt()
  @IsPositive()
  idMedicamento: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigoLote: string;

  @IsDateString()
  fechaCaducidad: string;

  @IsInt()
  @IsPositive()
  cantidad: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  precioCosto: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  precioVenta: number;

}
