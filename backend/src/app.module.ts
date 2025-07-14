import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import {Automacao} from './providers/calendario/automacao';
import { Notificacao } from './providers/calendario/notificacaoLembreteCliente';
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
//callback
import { CallBackController } from './controllers/callbakFacebbok';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // permite usar process.env em todo o app
    }),
    UploadModule, 
    ScheduleModule.forRoot()
  ],
  controllers: [
    CallBackController,
    colaboradorController, 
    LoginUserController, 
    RegisterUserController, 
    Calendario, 
    LoginCristerController, 
    Notifications
  ],
  providers: [
    Automacao, 
    Notificacao,
    colaboradorProvider, 
    LogunUserServices, 
    RegisterUserServide, 
    CalendarioEditorial, 
    LoginCristerService, 
  ],
})
export class AppModule {}
