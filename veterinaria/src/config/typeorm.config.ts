import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
    'database',
    (): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        schema: process.env.DB_SCHEMA,
        // Supabase exige conexión cifrada; en local se deja apagado (DB_SSL=false)
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        
        autoLoadEntities: true,
        synchronize: false,

    }),
);