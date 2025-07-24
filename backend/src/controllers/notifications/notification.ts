import { Body, Controller, Get, Post } from "@nestjs/common";
import * as webpush from 'web-push';
import connection from "src/database/connection";
import { NotFoundError } from "rxjs";


const publicKey = 'BLX2aIItjzqywDuszr0Gx9b6-WdwxIlwUWx2VO_daQGA6ccrsbdowUopB2KpFE9WmYJm1wybW-7uuClCL1d__H8';
const privateKey = 'gYlYb7-x14nlg5gaPS40n_ZdhnNzF_xHjBi7TUyzWzc';

webpush.setVapidDetails('https://acasaprime1.com.br/', publicKey, privateKey)

@Controller()
export class Notifications {
    //constructor(private readonly CalendarioEditorial: CalendarioEditorial) {};
    // rota para retornar a chave publica das notificações.
    @Get('notificationsKey')
    async NotificationsKey(){
        return {
            publicKey
        };
    };
    // verificar existejncai de notificação:
    @Post('notifications/check')
    async checkSubscription(@Body() body: any) {
        const { endpoint, keys } = body.subscription;

        const exists = await connection('notifications')
            .where('endPoint', endpoint)
            .first();

        if (exists) {
            // Já temos a assinatura registrada — tudo certo
            return { status: 'ok', message: 'Assinatura já existente' };
        }

        // Não encontrada — talvez expirou ou seja nova
        return { status: 'not_found' };
    }
    // registro de notificações de cada usuário
    @Post('notificationsRegister')
    async RegisterNotification(@Body() data: any): Promise<object>{
        const { token, tokenCrister, subscription, typeUser } = data;
        const { endpoint, expirationTime, keys } = subscription;
        const { p256dh, auth } = keys;
        let  response: any = 0;
        if(token === null){
            response = await connection('notifications')
            .where('idUser', tokenCrister)
            .where('endPoint', endpoint).select('*')
            console.log('oal', response);

        } else {
            response = await connection('notifications')
            .where('idUser', token)
            .where('endPoint', endpoint).select('*')
            console.log('oal', response);
        }
        
        //verificar se já temos o registro no banco:
        if(response.length > 0){
            // se > temos a assiunatura registrada no banco de dados.
            return {T: 'ja cadastrado'}
        } else {
            // não temos a assinatura registrada no banco de dados.
            //inserir token ou tokenCrister no banco com as demais informações.
            
            if(tokenCrister === null){ // se for nulo inserir o (token)
                const Data = {
                    idUser: token, 
                    typeUser,
                    endPoint: endpoint,
                    auth,
                    p256dh
                }
                console.log('tokenCrister', tokenCrister)
                let insertToken = await connection('notifications').insert(Data);
                console.log('ola', insertToken)
                return{T: 'cadastrado cliente'}

            } else if(token === null){
                const Data = {
                    idUser: tokenCrister, 
                    typeUser,
                    endPoint: endpoint,
                    auth,
                    p256dh
                }
                console.log('tokenCrister', tokenCrister)
                let insertToken = await connection('notifications').insert(Data);
                console.log('ola', insertToken)
                return {T: 'cadastradoCrister'}

            }
            return {}
        }        
    };
    // teste 
    @Get('get')
    async Delete(@Body() data: any): Promise<any>{
        let t = await connection('notifications').delete('*');
        return {t};
    };

    // rota + funcionalidade  para buscar as notificações dos Clientes.
    @Post('getNotification')
    async getNotifications(@Body() data: any): Promise<any>{
        console.log('Usertipe A - Crister colab ou empresa',data.userA);
        console.log('Usertipe B - Cristr cliente',data.userB)
        if(data.userA === null){
            // buscar notificações de clientes;
            let notifications = await connection('notificationArea').where('token', data.userB).where('status','pendente').select("*");
            console.log(notifications);
            return {NotFoundError}
        }else if(data.userB === null){
            // buscar notificações de colaboradores.
            let notifications = await connection('notificationArea').where('token', data.userA).where('status','pendente').select("*");
            console.log(notifications);
            return {NotFoundError}
        }
        console.log('ola na get notifications');
    };
    // rota para atualizar o status da notificação.
}