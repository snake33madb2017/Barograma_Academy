import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  app.use((req: any, res: any, next: any) => {
    req.user = { userId: 'public-user-id', id: 'public-user-id', role: 'SUPERADMIN' };
    next();
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
