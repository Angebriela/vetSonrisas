import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateLoteDto {

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
  @Min(0)
  stockActual: number;

  @IsNumber()
  precioCosto: number;

}
