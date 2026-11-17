import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateProveedorDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombreProveedor: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  nit?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{1,10}$/, {
    message: 'El teléfono debe contener únicamente números y tener como máximo 10 dígitos',
  })
  telefono: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  correo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;

}
