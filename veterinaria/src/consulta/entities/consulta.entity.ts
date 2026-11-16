import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cita } from '../../cita/entities/cita.entity.js';
import { Empleado } from '../../empleados/entities/empleados.entity.js';
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
