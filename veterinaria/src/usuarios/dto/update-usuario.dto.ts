import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

// No incluye la contraseña: se cambia con POST /usuarios/:id/contrasena
export class UpdateUsuarioDto {

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombreUsuario?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

}
