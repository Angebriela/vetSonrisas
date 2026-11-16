import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Medicamento } from '../../medicamento/entities/medicamento.entity.js';
import { VacunaDetalle } from '../../vacunas-detalle/entities/vacunas-detalle.entity.js';
import { CirugiaDetalle } from '../../cirugias-detalle/entities/cirugias-detalle.entity.js';
import { VentaDetalle } from '../../venta-detalle/entities/venta-detalle.entity.js';
import type { Relation } from 'typeorm';

@Entity({
  name: 'lote',
  schema: 'veterinariasonrisas',
})
export class Lote {

  @PrimaryGeneratedColumn({ name: 'idlote' })
  idLote: number;

  @Column({
    name: 'idmedicamento',
    type: 'int',
    nullable: false,
  })
  idMedicamento: number;

  @Column({
    name: 'codigolote',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  codigoLote: string;

  @Column({
    name: 'fechacaducidad',
    type: 'date',
    nullable: false,
  })
  fechaCaducidad: string;

  @Column({
    name: 'stockactual',
    type: 'int',
    nullable: false,
  })
  stockActual: number;

  @Column({
    name: 'preciocosto',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  precioCosto: number;

  @ManyToOne(() => Medicamento, (medicamento) => medicamento.lotes, {
    nullable: false,
  })
  @JoinColumn({ name: 'idmedicamento', referencedColumnName: 'idMedicamento' })
  medicamento: Relation<Medicamento>;

  @OneToMany(() => VacunaDetalle, (detalle) => detalle.lote)
  vacunasDetalles: Relation<VacunaDetalle>[];

  @OneToMany(() => CirugiaDetalle, (detalle) => detalle.lote)
  cirugiasDetalles: Relation<CirugiaDetalle>[];

  @OneToMany(() => VentaDetalle, (detalle) => detalle.lote)
  ventaDetalles: Relation<VentaDetalle>[];

}
