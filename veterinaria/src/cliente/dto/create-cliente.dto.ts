import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateClienteDto {

  @IsOptional()
  @IsString()
  nit?: string;


  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombreCliente: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  apellidoCliente: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{1,10}$/, {
    message: 'El teléfono debe contener únicamente números y tener como máximo 10 dígitos',
  })
  telefono: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  correo?: string;

}
