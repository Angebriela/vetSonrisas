import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cliente } from '../../cliente/entities/cliente.entity.js';
import { Empleado } from '../../empleados/entities/empleados.entity.js';
import { VentaDetalle } from '../../venta-detalle/entities/venta-detalle.entity.js';
import type { Relation } from 'typeorm';

@Entity({
  name: 'venta',
  schema: 'veterinariasonrisas',
})
export class Venta {

  @PrimaryGeneratedColumn({ name: 'idventa' })
  idVenta: number;

  @Column({
    name: 'idcliente',
    type: 'int',
    nullable: false,
  })
  idCliente: number;

  @Column({
    name: 'idempleado',
    type: 'int',
    nullable: false,
  })
  idEmpleado: number;

    @Column({
        name: 'fechaventa',
        type: 'date',
        nullable: true,
        default: () => 'CURRENT_DATE',
    })
    fechaVenta: string | null;

    @Column({
        name: 'horaventa',
        type: 'time',
        nullable: true,
        default: () => 'CURRENT_TIME',
    })
    horaVenta: string | null;

    @Column({
        name: 'nofactura',
        type: 'varchar',
        length: 50,
        nullable: false,
        unique: true,
    })
    noFactura: string;

    @Column({
        name: 'estado',
        type: 'varchar',
        length: 10,
        nullable: false,
        default: 'Emitida',
    })
    estado: string;

    @Column({
        name: 'motivoanulacion',
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    motivoAnulacion: string | null;

    @Column({
        name: 'fechaanulacion',
        type: 'timestamp',
        nullable: true,
    })
    fechaAnulacion: Date | null;

    @ManyToOne(() => Cliente, (cliente) => cliente.ventas, {
        nullable: false,
    })
    @JoinColumn({ name: 'idcliente', referencedColumnName: 'idCliente' })
    cliente: Relation<Cliente>;

    @ManyToOne(() => Empleado, (empleado) => empleado.ventas, {
        nullable: false,
    })
    @JoinColumn({ name: 'idempleado', referencedColumnName: 'idEmpleado' })
    empleado: Relation<Empleado>;

    @OneToMany(() => VentaDetalle, (detalle) => detalle.venta)
    detalles: Relation<VentaDetalle>[];

}
