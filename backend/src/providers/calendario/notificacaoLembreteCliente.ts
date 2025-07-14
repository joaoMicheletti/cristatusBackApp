import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import connection from 'src/database/connection';
import * as WebPush from 'web-push';
@Injectable()
export class Notificacao {
  private readonly logger = new Logger(Notificacao.name);
  @Cron('* 3 * * * *')  async handleCron() {
    console.log('sistema de automação de notificação em andamento')
    let sendNotifications = await connection('calendario').where('aprovadoCrister', 'aprovado').where('aprovadoCliente', null).select('*')
    this.logger.debug(sendNotifications);
    let c = 0;
    while(c < sendNotifications.length){
        console.log(c);
        // pegar id do usuárui e enviar notificação para ele.
        let idUser = sendNotifications[c].tokenUser;
        let listanotification = await connection('notifications').where('idUser', idUser);
        for(let i = 0; i < listanotification.length; i++ ){
            const subscription = {
                endpoint: listanotification[i].endPoint,
                keys: {
                    p256dh: listanotification[i].p256dh,
                    auth: listanotification[i].auth
                }

            };
            WebPush.sendNotification(subscription, `Conteudos aguardam por sua aprovação!.`)
            console.log(' corpo da notificação',subscription)
        }
        c ++;
    }
  }
}
