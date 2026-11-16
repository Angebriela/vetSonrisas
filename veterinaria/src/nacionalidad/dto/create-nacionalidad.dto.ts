import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateNacionalidadDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  pais: string;

}
