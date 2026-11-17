import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Compra } from './compra.entity.js';
import { Lote } from '../../lote/entities/lote.entity.js';
import type { Relation } from 'typeorm';

// No tiene CRUD propio: las filas se crean con el procedimiento sp_registrar_nuevo_lote
@Entity({
  name: 'compra_detalle',
  schema: 'veterinariasonrisas',
})
export class CompraDetalle {

  @PrimaryGeneratedColumn({ name: 'idcompradetalle' })
  idCompraDetalle: number;

  @Column({ name: 'idcompra', type: 'int', nullable: false })
  idCompra: number;

  @Column({ name: 'idlote', type: 'int', nullable: false })
  idLote: number;

  @Column({ name: 'cantidad', type: 'int', nullable: false })
  cantidad: number;

  @Column({ name: 'preciocosto', type: 'numeric', precision: 10, scale: 2, nullable: false })
  precioCosto: number;

  @ManyToOne(() => Compra, (compra) => compra.detalles, { nullable: false })
  @JoinColumn({ name: 'idcompra', referencedColumnName: 'idCompra' })
  compra: Relation<Compra>;

  @ManyToOne(() => Lote, { nullable: false })
  @JoinColumn({ name: 'idlote', referencedColumnName: 'idLote' })
  lote: Relation<Lote>;

}
