import {
  IsInt,
  IsPositive,
  IsString,
  IsOptional,
  IsDateString,
  Matches,
  MaxLength,
} from 'class-validator';

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

  @IsOptional()
  @IsString()
  @Matches(/^FAC-\d{4}$/, {
    message: 'noFactura debe tener el formato FAC-0000',
  })
  @MaxLength(50)
  noFactura?: string;
}
