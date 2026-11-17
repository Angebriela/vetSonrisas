import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { QueryFailedError } from 'typeorm';

/**
 * Convierte los errores de PostgreSQL en respuestas HTTP legibles.
 * P0001 es el código de RAISE EXCEPTION: así llegan al usuario los
 * mensajes de los triggers y de los procedimientos almacenados.
 */
@Catch(QueryFailedError)
export class DbExceptionFilter implements ExceptionFilter {
  catch(error: QueryFailedError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const driver = (error as any).driverError ?? {};
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno de base de datos';

    switch (driver.code) {
      case 'P0001': // RAISE EXCEPTION de triggers y procedimientos
        status = HttpStatus.BAD_REQUEST;
        message = driver.message;
        break;
      case '23505': // UNIQUE
        status = HttpStatus.CONFLICT;
        message = 'Ya existe un registro con esos datos';
        break;
      case '23503': // llave foránea
        status = HttpStatus.BAD_REQUEST;
        message = 'El registro relacionado no existe, o este registro está en uso';
        break;
      case '23514': // CHECK
        status = HttpStatus.BAD_REQUEST;
        message = 'Algún valor no cumple las reglas de la base de datos';
        break;
      case '23502': // NOT NULL
        status = HttpStatus.BAD_REQUEST;
        message = 'Falta un dato obligatorio';
        break;
    }

    response.status(status).json({ statusCode: status, message });
  }
}
