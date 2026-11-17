import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Proveedor } from '../../proveedor/entities/proveedor.entity.js';
import { Empleado } from '../../empleados/entities/empleados.entity.js';
import { CompraDetalle } from './compra-detalle.entity.js';
import type { Relation } from 'typeorm';

@Entity({
  name: 'compra',
  schema: 'veterinariasonrisas',
})
export class Compra {

  @PrimaryGeneratedColumn({ name: 'idcompra' })
  idCompra: number;

  @Column({ name: 'idproveedor', type: 'int', nullable: false })
  idProveedor: number;

  @Column({ name: 'idempleado', type: 'int', nullable: false })
  idEmpleado: number;

  @Column({
    name: 'fechacompra',
    type: 'date',
    nullable: false,
    default: () => 'CURRENT_DATE',
  })
  fechaCompra: string;

  @Column({ name: 'nofacturaproveedor', type: 'varchar', length: 50, nullable: true })
  noFacturaProveedor: string | null;

  @ManyToOne(() => Proveedor, { nullable: false })
  @JoinColumn({ name: 'idproveedor', referencedColumnName: 'idProveedor' })
  proveedor: Relation<Proveedor>;

  @ManyToOne(() => Empleado, { nullable: false })
  @JoinColumn({ name: 'idempleado', referencedColumnName: 'idEmpleado' })
  empleado: Relation<Empleado>;

  @OneToMany(() => CompraDetalle, (detalle) => detalle.compra)
  detalles: Relation<CompraDetalle>[];

}
