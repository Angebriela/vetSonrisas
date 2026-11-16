import {
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { Empleado } from '../../empleados/entities/empleados.entity.js';
import type { Relation } from 'typeorm';


@Entity({
    name: 'rol',
    schema: 'veterinariasonrisas',
})

export class Rol {

    @PrimaryGeneratedColumn({
        name: 'idrol',
    })
    idRol: number;

    @Column({
        name: 'nombrerol',
        type: 'varchar',
        length: 50,
        nullable: false,
    })
    nombreRol: string;

    @OneToMany(() => Empleado, (empleado) => empleado.rol)
    empleados: Relation<Empleado>[];

    @Column({
        name: 'detallerol',
        type: 'varchar',
        nullable: true,
    })
    detalleRol: string | null;
}
