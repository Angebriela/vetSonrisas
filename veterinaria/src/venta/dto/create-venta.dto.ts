import {
  IsInt,
  IsPositive,
  IsOptional,
  IsDateString,
  Matches,
} from 'class-validator';

// El número de factura ya no se envía: lo genera la base con la secuencia seq_factura.
export class CreateVentaDto {

  @IsInt()
  @IsPositive()
  idCliente: number;

  @IsInt()
  @IsPositive()
  idEmpleado: number;

  @IsOptional()
  @IsDateString()
  fechaVenta?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/, {
    message: 'horaVenta debe tener formato HH:mm o HH:mm:ss',
  })
  horaVenta?: string;
}
