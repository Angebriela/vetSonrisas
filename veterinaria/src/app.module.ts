import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import typeormConfig from './config/typeorm.config.js'; 

//export de las tablas
import { RolModule } from './rol/rol.module.js';
import { NacionalidadModule } from './nacionalidad/nacionalidad.module.js';
import { ClienteModule } from './cliente/cliente.module.js';
import { MedicamentoModule } from './medicamento/medicamento.module.js';
import { EmpleadoModule } from './empleados/empleados.module.js';
import { PacienteModule } from './paciente/paciente.module.js';
import { LoteModule } from './lote/lote.module.js';
import { AnamnesisModule } from './anamnesis/anamnesis.module.js';
import { CitaModule } from './cita/cita.module.js';
import { RegVacunaModule } from './regvacunas/regvacunas.module.js';
import { RegCirugiaModule } from './regcirugias/regcirugias.module.js';
import { VentaModule } from './venta/venta.module.js';
import { ConsultaModule } from './consulta/consulta.module.js';
import { VacunaDetalleModule } from './vacunas-detalle/vacunas-detalle.module.js';
import { CirugiaDetalleModule } from './cirugias-detalle/cirugias-detalle.module.js';
import { VentaDetalleModule } from './venta-detalle/venta-detalle.module.js';


@Module({ 
	imports: [ 
		ConfigModule.forRoot({ 
			isGlobal: true, 
			load: [typeormConfig], 
		}), 
		
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return configService.getOrThrow<TypeOrmModuleOptions>('database');
      },
      /*
      useFactory: (configService: ConfigService) => {
        return configService.getOrThrow<TypeOrmModuleOptions>('database');
      },*/
        //configService.get('database'),
    }),

    RolModule,
    NacionalidadModule,
    ClienteModule,
    MedicamentoModule,
    EmpleadoModule,
    PacienteModule,
    LoteModule,
    AnamnesisModule,
    CitaModule,
    RegVacunaModule,
    RegCirugiaModule,
    VentaModule,
    ConsultaModule,
    VacunaDetalleModule,
    CirugiaDetalleModule,
    VentaDetalleModule,




	], 
}) 
export class AppModule {}
