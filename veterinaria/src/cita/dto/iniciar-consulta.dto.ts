import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class IniciarConsultaDto {

  @IsInt()
  @IsPositive()
  idEmpleado: number;

  @IsString()
  @IsNotEmpty()
  motivoConsulta: string;

}
