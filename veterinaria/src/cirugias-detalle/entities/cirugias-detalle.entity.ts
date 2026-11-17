import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RegCirugia } from '../../regcirugias/entities/regcirugias.entity.js';
import { Lote } from '../../lote/entities/lote.entity.js';
import { Empleado } from '../../empleados/entities/empleados.entity.js';
import type { Relation } from 'typeorm';

@Entity({
  name: 'cirugias_detalle',
  schema: 'veterinariasonrisas',
})
export class CirugiaDetalle {

  @PrimaryGeneratedColumn({ name: 'iddetallecirugia' })
  idDetalleCirugia: number;

  @Column({
    name: 'idregcirugia',
    type: 'int',
    nullable: false,
  })
  idRegCirugia: number;

  @Column({
    name: 'idlote',
    type: 'int',
    nullable: false,
  })
  idLote: number;

  @Column({
    name: 'tipodecirugia',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  tipoDeCirugia: string | null;

  @Column({
    name: 'nombrecirugia',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  nombreCirugia: string | null;

  @Column({
    name: 'fechacirugia',
    type: 'date',
    nullable: true,
    default: () => 'CURRENT_DATE',
  })
  fechaCirugia: string | null;

  @Column({
    name: 'motivo',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  motivo: string | null;

  @Column({
    name: 'idempleado',
    type: 'int',
    nullable: false,
  })
  idEmpleado: number;

  @Column({
    name: 'cantidad',
    type: 'int',
    default: 1,
    nullable: false,
  })
  cantidad: number;

  @ManyToOne(() => Empleado, {
    nullable: false,
  })
  @JoinColumn({ name: 'idempleado', referencedColumnName: 'idEmpleado' })
  empleado: Relation<Empleado>;

  @ManyToOne(() => RegCirugia, (regCirugia) => regCirugia.detalles, {
    nullable: false,
  })
  @JoinColumn({ name: 'idregcirugia', referencedColumnName: 'idRegCirugias' })
  regCirugia: Relation<RegCirugia>;

  @ManyToOne(() => Lote, (lote) => lote.cirugiasDetalles, {
    nullable: false,
  })
  @JoinColumn({ name: 'idlote', referencedColumnName: 'idLote' })
  lote: Relation<Lote>;

}
