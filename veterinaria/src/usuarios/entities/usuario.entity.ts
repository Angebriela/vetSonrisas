import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Empleado } from '../../empleados/entities/empleados.entity.js';
import type { Relation } from 'typeorm';

// El rol no es columna de usuario: se obtiene por usuario -> empleado -> rol (3FN)
@Entity({
  name: 'usuario',
  schema: 'veterinariasonrisas',
})
export class Usuario {

  @PrimaryGeneratedColumn({ name: 'idusuario' })
  idUsuario: number;

  @Column({
    name: 'idempleado',
    type: 'int',
    nullable: false,
    unique: true,
  })
  idEmpleado: number;

  @Column({
    name: 'nombreusuario',
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: true,
  })
  nombreUsuario: string;

  // select: false -> TypeORM nunca lo lee en find(), así el hash no sale en ninguna respuesta
  @Column({
    name: 'contrasenahash',
    type: 'varchar',
    length: 100,
    nullable: false,
    select: false,
  })
  contrasenaHash: string;

  @Column({
    name: 'activo',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  activo: boolean;

  @Column({
    name: 'fechacreacion',
    type: 'timestamp',
    nullable: false,
  })
  fechaCreacion: Date;

  @Column({
    name: 'ultimoacceso',
    type: 'timestamp',
    nullable: true,
  })
  ultimoAcceso: Date | null;

  @ManyToOne(() => Empleado, {
    nullable: false,
  })
  @JoinColumn({ name: 'idempleado', referencedColumnName: 'idEmpleado' })
  empleado: Relation<Empleado>;

}
