import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Paciente } from '../../paciente/entities/paciente.entity.js';
import { Consulta } from '../../consulta/entities/consulta.entity.js';
import { Empleado } from '../../empleados/entities/empleados.entity.js';
import type { Relation } from 'typeorm';

@Entity({
  name: 'cita',
  schema: 'veterinariasonrisas',
})
export class Cita {

  @PrimaryGeneratedColumn({ name: 'idcita' })
  idCita: number;

  @Column({
    name: 'idpaciente',
    type: 'int',
    nullable: false,
  })
  idPaciente: number;

  @Column({
    name: 'idempleado',
    type: 'int',
    nullable: false,
  })
  idEmpleado: number;

  @Column({
    name: 'asuntocita',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  asuntoCita: string | null;

  @Column({
    name: 'fechacita',
    type: 'date',
    nullable: false,
  })
  fechaCita: string;

  @Column({
    name: 'horainicio',
    type: 'time',
    nullable: false,
  })
  horaInicio: string;

  @Column({
    name: 'horafin',
    type: 'time',
    nullable: false,
  })
  horaFin: string;

  @Column({
    name: 'estadocita',
    type: 'varchar',
    length: 20,
    nullable: false,
    default: 'Pendiente',
  })
  estadoCita: string;

  @ManyToOne(() => Paciente, (paciente) => paciente.citas, {
    nullable: false,
  })
  @JoinColumn({ name: 'idpaciente', referencedColumnName: 'idPaciente' })
  paciente: Relation<Paciente>;

  @ManyToOne(() => Empleado, {
    nullable: false,
  })
  @JoinColumn({ name: 'idempleado', referencedColumnName: 'idEmpleado' })
  empleado: Relation<Empleado>;

  @OneToMany(() => Consulta, (consulta) => consulta.cita)
  consultas: Relation<Consulta>[];

}
