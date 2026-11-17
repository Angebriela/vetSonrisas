import { SetMetadata } from '@nestjs/common';

export const ES_PUBLICA = 'esPublica';

// Marca una ruta que no exige token (GET / y POST /auth/login)
export const Public = () => SetMetadata(ES_PUBLICA, true);
