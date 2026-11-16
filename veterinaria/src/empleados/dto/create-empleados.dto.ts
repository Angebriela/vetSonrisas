import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEmpleadoDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  noIdentificacion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombreEmpleado: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidoEmpleado: string;

  @IsDateString()
  fechaNacimientoEmpleado: string;

  @IsInt()
  idNacionalidad: number;

  @IsInt()
  idRol: number;

}
