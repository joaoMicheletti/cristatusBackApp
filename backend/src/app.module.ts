import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
//import {Automacao} from './providers/calendario/automacao';
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
//rota de notificatção.
import { Notifications } from './controllers/notifications/notification';

//cadastro de colaborador:
import { colaboradorProvider } from './providers/colaborador/colaboradorService';
import {colaboradorController} from './controllers/colaborador/colaboradorController';
@Module({
  imports: [
    UploadModule, 
    ScheduleModule.forRoot()
  ],
  controllers: [
    colaboradorController, 
    LoginUserController, 
    RegisterUserController, 
    Calendario, 
    LoginCristerController, 
    Notifications
  ],
  providers: [
  //  Automacao, 
    colaboradorProvider, 
    LogunUserServices, 
    RegisterUserServide, 
    CalendarioEditorial, 
    LoginCristerService, 
  ],
})
export class AppModule {}
