import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AnularVentaDto {

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  motivo: string;

}
