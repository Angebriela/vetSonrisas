import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Paciente } from '../../paciente/entities/paciente.entity.js';
import { VacunaDetalle } from '../../vacunas-detalle/entities/vacunas-detalle.entity.js';
import type { Relation } from 'typeorm';

@Entity({
  name: 'regvacunas',
  schema: 'veterinariasonrisas',
})
export class RegVacuna {

  @PrimaryGeneratedColumn({ name: 'idregvacunas' })
  idRegVacunas: number;

  @Column({
    name: 'idpaciente',
    type: 'int',
    nullable: false,
    unique: true,
  })
  idPaciente: number;

  @Column({
    name: 'fechaapertura',
    type: 'date',
    nullable: false,
    default: () => 'CURRENT_DATE',
  })
  fechaApertura: string;

  @ManyToOne(() => Paciente, (paciente) => paciente.regVacunas, {
    nullable: false,
  })
  @JoinColumn({ name: 'idpaciente', referencedColumnName: 'idPaciente' })
  paciente: Relation<Paciente>;

  @OneToMany(() => VacunaDetalle, (detalle) => detalle.regVacunas)
  detalles: Relation<VacunaDetalle>[];

}
