import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UploadController } from './uploadFileController';
import { diskStorage } from 'multer';
import * as path from 'path';
var t = path.join(__dirname, '..', '..', 'src', 'public');
console.log(t);

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: path.join(__dirname, '..','..','..','..', 'src', 'public'), // Diretório onde os arquivos serão armazenados
        filename: (req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  ],
  controllers: [UploadController],
})
export class UploadModule {}