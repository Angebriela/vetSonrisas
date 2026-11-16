import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Paciente } from '../../paciente/entities/paciente.entity.js';
import type { Relation } from 'typeorm';

@Entity({
  name: 'anamnesis',
  schema: 'veterinariasonrisas',
})
export class Anamnesis {

  @PrimaryGeneratedColumn({ name: 'noficha' })
  noFicha: number;

  @Column({
    name: 'idpaciente',
    type: 'int',
    nullable: false,
  })
  idPaciente: number;

  @Column({
    name: 'dieta',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  dieta: string | null;

  @Column({
    name: 'enfermedadesprevias',
    type: 'varchar',
    length: undefined,
    nullable: true,
  })
  enfermedadesPrevias: string | null;

  @Column({
    name: 'cirugiasprevias',
    type: 'varchar',
    length: undefined,
    nullable: true,
  })
  cirugiasPrevias: string | null;

  @Column({
    name: 'esterilizado',
    type: 'boolean',
    nullable: true,
  })
  esterilizado: boolean | null;

  @Column({
    name: 'nopartos',
    type: 'int',
    nullable: true,
  })
  noPartos: number | null;

  @Column({
    name: 'desparasitada',
    type: 'boolean',
    nullable: true,
  })
  desparasitada: boolean | null;

  @Column({
    name: 'viajesrecientes',
    type: 'boolean',
    nullable: true,
  })
  viajesRecientes: boolean | null;

  @Column({
    name: 'viveconanimales',
    type: 'boolean',
    nullable: true,
  })
  viveConAnimales: boolean | null;

  @Column({
    name: 'comportamiento',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  comportamiento: string | null;

  @ManyToOne(() => Paciente, (paciente) => paciente.anamnesis, {
    nullable: false,
  })
  @JoinColumn({ name: 'idpaciente', referencedColumnName: 'idPaciente' })
  paciente: Relation<Paciente>;

}
