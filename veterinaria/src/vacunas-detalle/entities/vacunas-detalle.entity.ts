import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RegVacuna } from '../../regvacunas/entities/regvacunas.entity.js';
import { Lote } from '../../lote/entities/lote.entity.js';
import { Empleado } from '../../empleados/entities/empleados.entity.js';
import type { Relation } from 'typeorm';

@Entity({
  name: 'vacunas_detalle',
  schema: 'veterinariasonrisas',
})
export class VacunaDetalle {

  @PrimaryGeneratedColumn({ name: 'iddetallevacuna' })
  idDetalleVacuna: number;

  @Column({
    name: 'idregvacunas',
    type: 'int',
    nullable: false,
  })
  idRegVacunas: number;

  @Column({
    name: 'idlote',
    type: 'int',
    nullable: false,
  })
  idLote: number;

  @Column({
    name: 'dosis',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  dosis: string | null;

  @Column({
    name: 'fechaadministrada',
    type: 'date',
    nullable: true,
    default: () => 'CURRENT_DATE',
  })
  fechaAdministrada: string | null;

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
    nullable: true,
  })
  idEmpleado: number | null;

  @Column({
    name: 'cantidad',
    type: 'int',
    default: 1,
    nullable: false,
  })
  cantidad: number;

  @Column({
    name: 'proximadosis',
    type: 'date',
    nullable: true,
  })
  proximaDosis: string | null;

  @ManyToOne(() => Empleado, {
    nullable: true,
  })
  @JoinColumn({ name: 'idempleado', referencedColumnName: 'idEmpleado' })
  empleado: Relation<Empleado> | null;

  @ManyToOne(() => RegVacuna, (regVacunas) => regVacunas.detalles, {
    nullable: false,
  })
  @JoinColumn({ name: 'idregvacunas', referencedColumnName: 'idRegVacunas' })
  regVacunas: Relation<RegVacuna>;

  @ManyToOne(() => Lote, (lote) => lote.vacunasDetalles, {
    nullable: false,
  })
  @JoinColumn({ name: 'idlote', referencedColumnName: 'idLote' })
  lote: Relation<Lote>;

}
