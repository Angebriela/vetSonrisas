import { IsInt, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUsuarioDto {

  @IsInt()
  idEmpleado: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombreUsuario: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contrasena: string;

}
