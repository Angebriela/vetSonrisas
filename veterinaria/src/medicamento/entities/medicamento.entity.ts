import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Lote } from '../../lote/entities/lote.entity.js';
import type { Relation } from 'typeorm';

@Entity({
  name: 'medicamento',
  schema: 'veterinariasonrisas',
})
export class Medicamento {

  @PrimaryGeneratedColumn({ name: 'idmedicamento' })
  idMedicamento: number;

  @Column({
    name: 'nombremed',
    type: 'varchar',
    length: 150,
    nullable: false,
  })
  nombreMed: string;

  @Column({
    name: 'contenidoneto',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  contenidoNeto: string | null;

  @Column({
    name: 'tipomedicamento',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  tipoMedicamento: string | null;

  @Column({
    name: 'viaadministracion',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  viaAdministracion: string | null;

  @Column({
    name: 'presentacion',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  presentacion: string | null;

  @Column({
    name: 'aptoparaventa',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  aptoParaVenta: boolean;

  @Column({
    name: 'usoclinico',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  usoClinico: boolean;

  @OneToMany(() => Lote, (lote) => lote.medicamento)
  lotes: Relation<Lote>[];

}
