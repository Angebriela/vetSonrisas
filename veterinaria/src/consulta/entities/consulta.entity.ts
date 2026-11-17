import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cita } from '../../cita/entities/cita.entity.js';
import { Empleado } from '../../empleados/entities/empleados.entity.js';
import { Paciente } from '../../paciente/entities/paciente.entity.js';
import type { Relation } from 'typeorm';

@Entity({
  name: 'consulta',
  schema: 'veterinariasonrisas',
})
export class Consulta {

  @PrimaryGeneratedColumn({ name: 'idconsulta' })
  idConsulta: number;

  @Column({
    name: 'idcita',
    type: 'int',
    nullable: true,
  })
  idCita: number | null;

  @Column({
    name: 'idempleado',
    type: 'int',
    nullable: false,
  })
  idEmpleado: number;

  @Column({
    name: 'motivoconsulta',
    type: 'varchar',
    nullable: false,
  })
  motivoConsulta: string;

  @Column({
    name: 'fechaconsulta',
    type: 'date',
    nullable: false,
    default: () => 'CURRENT_DATE',
  })
  fechaConsulta: string;

  @Column({
    name: 'horaconsulta',
    type: 'time',
    nullable: false,
    default: () => 'CURRENT_TIME',
  })
  horaConsulta: string;

  @Column({
    name: 'idpaciente',
    type: 'int',
    nullable: false,
  })
  idPaciente: number;

  @Column({
    name: 'peso',
    type: 'numeric',
    precision: 6,
    scale: 2,
    nullable: true,
  })
  peso: number | null;

  @Column({
    name: 'temperatura',
    type: 'numeric',
    precision: 4,
    scale: 1,
    nullable: true,
  })
  temperatura: number | null;

  @Column({
    name: 'diagnostico',
    type: 'varchar',
    nullable: true,
  })
  diagnostico: string | null;

  @Column({
    name: 'tratamiento',
    type: 'varchar',
    nullable: true,
  })
  tratamiento: string | null;

  //Relacion
  @ManyToOne(() => Paciente, {
    nullable: false,
  })
  
  @JoinColumn({ 
    name: 'idpaciente', 
    referencedColumnName: 'idPaciente'
  })
  paciente: Relation<Paciente>;

  @ManyToOne(() => Cita, (cita) => cita.consultas, {
    nullable: true,
  })
  @JoinColumn({ name: 'idcita', referencedColumnName: 'idCita' })
  cita: Relation<Cita> | null;

  @ManyToOne(() => Empleado, (empleado) => empleado.consultas, {
    nullable: false,
  })
  @JoinColumn({ name: 'idempleado', referencedColumnName: 'idEmpleado' })
  empleado: Relation<Empleado>;

}
