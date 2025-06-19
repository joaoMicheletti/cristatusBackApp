import { Module } from '@nestjs/common';
// login User Cliente
import { LoginUserController } from './controllers/loginUserClient/luginUserController';
import { LogunUserServices } from './providers/loginUserClient/loginUserservices';

//Register User Cliente
import {RegisterUserController} from './controllers/registerUserClient/registerUserContreoller';
import {RegisterUserServide} from './providers/registerUserClient/registerUserClient';
//calendario editorial :
import { CalendarioEditorial } from './providers/calendario/calendariService';
import { Calendario } from './controllers/caledarioController/calendarioController';

//loginCrister
import { LoginCristerService } from './providers/loginCrister/loginCristerService';
import { LoginCristerController } from './controllers/loginCrister/loginCrister';

//modulo para upload de arquivos:
import { UploadModule } from './controllers/caledarioController/uploadModules';
@Module({
  imports: [UploadModule],
  controllers: [LoginUserController, RegisterUserController, Calendario, LoginCristerController],
  providers: [LogunUserServices, RegisterUserServide, CalendarioEditorial, LoginCristerService],
})
export class AppModule {}
