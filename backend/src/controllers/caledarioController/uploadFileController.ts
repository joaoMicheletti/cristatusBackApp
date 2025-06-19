import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class UploadController {
  @Post('/file')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file); // Log do arquivo para depuração
    return {
      filename: file.filename,
    };
  }
}