import {
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Column,
} from 'typeorm';
import { Venta } from '../../venta/entities/venta.entity.js';
import { Lote } from '../../lote/entities/lote.entity.js';
import type { Relation } from 'typeorm';


@Entity({
    name: 'venta_detalle',
    schema: 'veterinariasonrisas',
})

export class VentaDetalle {

    @PrimaryGeneratedColumn({
        name: 'iddetalleventa',
    })
    idDetalleVenta: number;

    @Column({
        name: 'idventa',
        type: 'int',
        nullable: false,
    })
    idVenta: number;

    @Column({
        name: 'idlote',
        type: 'int',
        nullable: false,
    })
    idLote: number;

    @Column({
        name: 'cantmedicamento',
        type: 'int',
        nullable: false,
    })
    cantMedicamento: number;

    @Column({
        name: 'precioventa',
        type: 'numeric',
        precision: 10,
        scale: 2,
        nullable: false,
        transformer: {
            to: (value?: number) => value,
            from: (value: string | null) =>
                value === null ? null : parseFloat(value),
        },
    })
    precioVenta: number;

    @ManyToOne(() => Venta, (venta) => venta.detalles, {
        nullable: false,
    })
    @JoinColumn({ name: 'idventa', referencedColumnName: 'idVenta' })
    venta: Relation<Venta>;

    @ManyToOne(() => Lote, (lote) => lote.ventaDetalles, {
        nullable: false,
    })
    @JoinColumn({ name: 'idlote', referencedColumnName: 'idLote' })
    lote: Relation<Lote>;
}
