import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRegCirugiaDto {

  @IsNotEmpty()
  @IsInt()
  idPaciente: number;

}
