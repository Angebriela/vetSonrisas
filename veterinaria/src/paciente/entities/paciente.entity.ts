import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cliente } from '../../cliente/entities/cliente.entity.js';
import { Anamnesis } from '../../anamnesis/entities/anamnesis.entity.js';
import { Cita } from '../../cita/entities/cita.entity.js';
import { RegVacuna } from '../../regvacunas/entities/regvacunas.entity.js';
import { RegCirugia } from '../../regcirugias/entities/regcirugias.entity.js';
import type { Relation } from 'typeorm';

@Entity({
  name: 'paciente',
  schema: 'veterinariasonrisas',
})
export class Paciente {

  @PrimaryGeneratedColumn({ name: 'idpaciente' })
  idPaciente: number;

  @Column({
    name: 'idcliente',
    type: 'int',
    nullable: false,
  })
  idCliente: number;

  @Column({
    name: 'nombrepaciente',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  nombrePaciente: string;

  @Column({
    name: 'especiepaciente',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  especiePaciente: string;

  @Column({
    name: 'razapaciente',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  razaPaciente: string | null;

  @Column({
    name: 'sexopaciente',
    type: 'char',
    length: 1,
    nullable: true,
  })
  sexoPaciente: string | null;

  @Column({
    name: 'colorpaciente',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  colorPaciente: string | null;

  @Column({
    name: 'fechanacimiento',
    type: 'date',
    nullable: true,
  })
  fechaNacimiento: string | null;

  @Column({
    name: 'pesopaciente',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  pesoPaciente: number | null;

  @Column({
    name: 'tipopelaje',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  tipoPelaje: string | null;

  @Column({
    name: 'identificacionesparticulares',
    type: 'varchar',
    length: undefined,
    nullable: true,
  })
  identificacionesParticulares: string | null;

  @Column({
    name: 'finzootecnico',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  finZootecnico: string | null;

  @ManyToOne(() => Cliente, (cliente) => cliente.pacientes, {
    nullable: false,
  })
  @JoinColumn({ name: 'idcliente', referencedColumnName: 'idCliente' })
  cliente: Relation<Cliente>;

  @OneToMany(() => Anamnesis, (anamnesis) => anamnesis.paciente)
  anamnesis: Relation<Anamnesis>[];

  @OneToMany(() => Cita, (cita) => cita.paciente)
  citas: Relation<Cita>[];

  @OneToMany(() => RegVacuna, (regVacuna) => regVacuna.paciente)
  regVacunas: Relation<RegVacuna>[];

  @OneToMany(() => RegCirugia, (regCirugia) => regCirugia.paciente)
  regCirugias: Relation<RegCirugia>[];

}
