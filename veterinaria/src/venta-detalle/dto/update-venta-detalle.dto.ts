import { PartialType } from '@nestjs/mapped-types';
import { CreateVentaDetalleDto } from './create-venta-detalle.dto.js';

export class UpdateVentaDetalleDto extends PartialType(CreateVentaDetalleDto) {}
