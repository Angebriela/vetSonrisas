import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateRolDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombreRol: string;

  @IsOptional()
  @IsString()
  detalleRol?: string;
}