import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Nacionalidad } from '../../nacionalidad/entities/nacionalidad.entity.js';
import { Rol } from '../../rol/entities/rol.entity.js';
import { Venta } from '../../venta/entities/venta.entity.js';
import { Consulta } from '../../consulta/entities/consulta.entity.js';
import type { Relation } from 'typeorm';

@Entity({
  name: 'empleados',
  schema: 'veterinariasonrisas',
})
export class Empleado {

  @PrimaryGeneratedColumn({ name: 'idempleado' })
  idEmpleado: number;

  @Column({
    name: 'noidentificacion',
    type: 'varchar',
    length: 20,
    nullable: false,
    unique: true,
  })
  noIdentificacion: string;

  @Column({
    name: 'nombreempleado',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  nombreEmpleado: string;

  @Column({
    name: 'apellidoempleado',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  apellidoEmpleado: string;

  @Column({
    name: 'fechanacimientoempleado',
    type: 'date',
    nullable: false,
  })
  fechaNacimientoEmpleado: string;

  @Column({
    name: 'idnacionalidad',
    type: 'int',
    nullable: false,
  })
  idNacionalidad: number;

  @Column({
    name: 'idrol',
    type: 'int',
    nullable: false,
  })
  idRol: number;

  @ManyToOne(() => Nacionalidad, (nacionalidad) => nacionalidad.empleados, {
    nullable: false,
  })
  @JoinColumn({ name: 'idnacionalidad', referencedColumnName: 'idNacionalidad' })
  nacionalidad: Relation<Nacionalidad>;

  @ManyToOne(() => Rol, (rol) => rol.empleados, {
    nullable: false,
  })
  @JoinColumn({ name: 'idrol', referencedColumnName: 'idRol' })
  rol: Relation<Rol>;

  @OneToMany(() => Venta, (venta) => venta.empleado)
  ventas: Relation<Venta>[];

  @OneToMany(() => Consulta, (consulta) => consulta.empleado)
  consultas: Relation<Consulta>[];

}
