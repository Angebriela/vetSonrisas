import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Paciente } from '../../paciente/entities/paciente.entity.js';
import { Venta } from '../../venta/entities/venta.entity.js';
import type { Relation } from 'typeorm';

@Entity({
  name: 'cliente',
  schema: 'veterinariasonrisas',
})
export class Cliente {

  @PrimaryGeneratedColumn({ name: 'idcliente' })
  idCliente: number;

  @Column({
    name: 'nit',
    type: 'varchar',
    length: 15,
    nullable: true,
    default: 'CF',
  })
  nit: string | null;

  @Column({
    name: 'nombrecliente',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  nombreCliente: string;

  @Column({
    name: 'apellidocliente',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  apellidoCliente: string;

  @Column({
    name: 'direccion',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  direccion: string | null;

  @Column({
    name: 'telefono',
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  telefono: string;

  @Column({
    name: 'correo',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  correo: string | null;

  // TRUE solo para el cliente que representa a la propia clínica (consumo interno)
  @Column({
    name: 'esinterno',
    type: 'boolean',
    default: false,
    nullable: false,
  })
  esInterno: boolean;

  @OneToMany(() => Paciente, (paciente) => paciente.cliente)
  pacientes: Relation<Paciente>[];

  @OneToMany(() => Venta, (venta) => venta.cliente)
  ventas: Relation<Venta>[];

}
