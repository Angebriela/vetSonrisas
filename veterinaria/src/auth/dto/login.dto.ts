import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombreUsuario: string;

  @IsString()
  @IsNotEmpty()
  contrasena: string;

}
