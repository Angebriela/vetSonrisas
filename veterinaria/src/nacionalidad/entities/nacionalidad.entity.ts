import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Empleado } from '../../empleados/entities/empleados.entity.js';
import type { Relation } from 'typeorm';

@Entity({
  name: 'nacionalidad',
  schema: 'veterinariasonrisas',
})
export class Nacionalidad {

  @PrimaryGeneratedColumn({ name: 'idnacionalidad' })
  idNacionalidad: number;

  @Column({
    name: 'pais',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  pais: string;

  @OneToMany(() => Empleado, (empleado) => empleado.nacionalidad)
  empleados: Relation<Empleado>[];

}
