import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOptions: CorsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);

  const publicDir = path.join(__dirname, '..', '..', 'src', 'public');

  app.use('/image', (req, res, next) => {
  const filePath = path.join(publicDir, req.path);
  console.log('Arquivo solicitado:', filePath);

  if (!fs.existsSync(filePath)) {
    console.log('Arquivo não encontrado:', filePath);
    return res.status(404).send('Arquivo não encontrado');
  }

  if (filePath.toLowerCase().endsWith('.mp4')) {
    console.log('Requisição de vídeo mp4');
    
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Content-Length', fileSize); // 🚨 necessário para o Instagram

    const stream = fs.createReadStream(filePath);
    return stream.pipe(res);
  }

  // Se não for .mp4, delega para o middleware estático padrão
  express.static(publicDir)(req, res, next);
  });

  await app.listen(3333);
  console.log(`Aplicação rodando em: http://localhost:3333`);
}

bootstrap();
