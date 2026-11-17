import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'proveedor',
  schema: 'veterinariasonrisas',
})
export class Proveedor {

  @PrimaryGeneratedColumn({ name: 'idproveedor' })
  idProveedor: number;

  @Column({ name: 'nombreproveedor', type: 'varchar', length: 150, nullable: false })
  nombreProveedor: string;

  @Column({ name: 'nit', type: 'varchar', length: 15, nullable: true })
  nit: string | null;

  @Column({ name: 'telefono', type: 'varchar', length: 20, nullable: false })
  telefono: string;

  @Column({ name: 'correo', type: 'varchar', length: 100, nullable: true })
  correo: string | null;

  @Column({ name: 'direccion', type: 'varchar', length: 255, nullable: true })
  direccion: string | null;

}
