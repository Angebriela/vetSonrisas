import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateRegVacunaDto {

  @IsNotEmpty()
  @IsInt()
  idPaciente: number;

}
