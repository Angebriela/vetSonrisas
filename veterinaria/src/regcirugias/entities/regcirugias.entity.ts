import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Paciente } from '../../paciente/entities/paciente.entity.js';
import { CirugiaDetalle } from '../../cirugias-detalle/entities/cirugias-detalle.entity.js';
import type { Relation } from 'typeorm';

@Entity({
  name: 'regcirugias',
  schema: 'veterinariasonrisas',
})
export class RegCirugia {

  @PrimaryGeneratedColumn({ name: 'idregcirugias' })
  idRegCirugias: number;

  @Column({
    name: 'idpaciente',
    type: 'int',
    nullable: false,
  })
  idPaciente: number;

  @ManyToOne(() => Paciente, (paciente) => paciente.regCirugias, {
    nullable: false,
  })
  @JoinColumn({ name: 'idpaciente', referencedColumnName: 'idPaciente' })
  paciente: Relation<Paciente>;

  @OneToMany(() => CirugiaDetalle, (detalle) => detalle.regCirugia)
  detalles: Relation<CirugiaDetalle>[];

}
