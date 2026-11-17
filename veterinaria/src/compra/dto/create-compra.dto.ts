import {
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCompraDto {

  @IsInt()
  @IsPositive()
  idProveedor: number;

  // Empleado que recibe la mercadería
  @IsInt()
  @IsPositive()
  idEmpleado: number;

  @IsOptional()
  @IsDateString()
  fechaCompra?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  noFacturaProveedor?: string;

}
