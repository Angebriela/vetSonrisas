import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './auth/public.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Pública: el frontend la usa para comprobar la conexión antes de iniciar sesión
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
