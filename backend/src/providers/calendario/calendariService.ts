import {Injectable } from "@nestjs/common";
import { console, url } from "inspector";
import { CalendarioDTO } from "src/controllers/caledarioController/calendarioDTo";
import connection from "src/database/connection";
// importação do zod para criar o objeto com type script para enviar a notificação.

//importando a lib para fazer o push da notificação 
import * as WebPush from 'web-push';
@Injectable()

export class CalendarioEditorial {
    async createCalendario(data: CalendarioDTO): Promise<object>{ 
        console.log('dataCrono',data)
        console.log(data);       
        let resp = await connection("calendario").insert(data);
        console.log(resp);
        if(resp.length > 0){
            return {res: 1}
        }else {
            return{res: "Erro ao criar Calendario editorial"};
        };
    };
    async buscarData(data: CalendarioDTO): Promise<object> {
        console.log(data.tokenUser);
        let response = await connection('calendario')
        .where('tokenUser', data.tokenUser)
        .where('dia', data.dia)
        .where('mes', data.mes)
        .where('ano', data.ano)
        .select("*")
        console.log(response.length)
        return{res: response.length};
    };
    async buscarCalendario(data: CalendarioDTO): Promise<object> {
        // quebra “DD-MM-YYYY”
        const [diaI, mesI, anoI] = data.inicio.split('-');
        const [diaF, mesF, anoF] = data.fim.split('-');

        // monta YYYY-MM-DD
        const dataInicio = `${anoI}-${mesI.padStart(2, '0')}-${diaI.padStart(2, '0')}`;
        const dataFim    = `${anoF}-${mesF.padStart(2, '0')}-${diaF.padStart(2, '0')}`;

        const res = await connection('calendario')
            .where('tokenUser', data.tokenUser)
            .andWhereRaw(
            // strftime format: garante '2025-05-09' mesmo que mes/dia sejam inteiros
            `strftime('%Y-%m-%d',
                ano || '-' || printf('%02d', mes) || '-' || printf('%02d', dia)
            ) BETWEEN ? AND ?`,
            [dataInicio, dataFim]
            )
            .orderBy(['id']);

        return { res };
    };
    // aprovação - send
    async aprovacao(data: CalendarioDTO): Promise<object>{
        console.log('A', data)
        let res = await connection('calendario')
        .where('tokenUser', data.tokenUser)
        .where('dia', data.dia)
        .where('mes', data.mes)
        .where('ano', data.ano)
        .update('tema', data.tema)
        .update('formato', data.formato)
        .update('legenda', data.legenda)
        .update('descricaoArte', data.descricaoArte);
        let Cliente = await connection('cliente').where('token', data.tokenUser).select('*');
        console.log('cliente', Cliente);
        console.log('resposta',res);
        // inviar notificação /avisando os editores que o material esta diponivel e aguarda a criação dos conteudos.
        // como nao temos o sistema de colaboradores e sus respectivas responsabilidades vamos encamiha a notificação para todos.
        // vincular perfil dos clientes ao editor / designer
        //variavel com a empresa 
        console.log('Cliente erro',Cliente)
        let empresa = Cliente[0].empresa;
        
        // disparar notificação somente para o responsavel. ou seja atraves do token do usuario vamos inviar essa notificação.
        // pegar dados dos funcionarios da empres que cuida do perfil do lead atual:
        let colaboradores =  await connection('colaborador').where('empresa', empresa);
        
        // loop para mandar notificação para os responsaveis pela edição / designer
        let contador = 0;
        while(contador < colaboradores.length){
            if(colaboradores[contador].funcao === 'editor'|| colaboradores[contador].funcao === 'designer'){
                //registar notificação no banco de dados;
                let insetDataNotification = {
                    token: colaboradores[contador].token,
                    corpoNotification: `Crie e faça o upload das midias para o post da DATA: ${data.dia}/${data.mes}/${data.ano} do Cliente : ${Cliente[0].user}`,
                    status: 'pendente'
                };
                
                let notificationRegisterAreaNotification  = await connection('notificationArea').insert(insetDataNotification);
                console.log('REgistrando notificação na area de notificação.', notificationRegisterAreaNotification);
                
                // envioar notificação ?webPush.
                let notFicationIndivisdual = await connection('notifications').where('idUser', colaboradores[contador].token).select('*')
                const subscription = {
                    endpoint: notFicationIndivisdual[0].endPoint,
                    keys: {
                        p256dh: notFicationIndivisdual[0].p256dh,
                        auth: notFicationIndivisdual[0].auth
                    }
                };
                WebPush.sendNotification(subscription, `Crie e faça o upload das midias para o post da DATA: ${data.dia}/${data.mes}/${data.ano} do Cliente : ${Cliente[0].user}`)
                .then(() => {
                    // Se a notificação for enviada, verificamos e registramos a assinatura
                    console.log("Mensaguem enviada");
                })
                .catch(error => {
                    console.error('Erro ao enviar notificação', error);
                });
                console.log('notificação para Editores / social medias');
            }
            contador++
        }
        return({})
    };




    // buscar para area de updateMidias -
    async buscarUpdateMidia(data: CalendarioDTO): Promise<object>{
        console.log(data);
        let res = {}; // retono da função
        // ano. mes, dia - formatação da data
        let inicio = data.inicio.split('-');
        let fim = data.fim.split('-');
        console.log(inicio[0],'<<<<< inicio')
        console.log(fim[0],'<<<< fim')
        if(inicio[0] === '' && fim[0] === ''){
            let resp = "não foi enviado uma data"
            res = resp
        }else if(inicio[0] === ''){
            console.log('inicio vazio', data)
            // buscar com a data de termino;
            let Dia = parseInt(fim[2]);// correção do valor remoção do 0 a esquerda;
            let Mes = parseInt(fim[1]); // correção do  valor remoção de 0 a esquerda;
            console.log(Dia, Mes)
            let resp = await connection('calendario').where('tokenUser', data.tokenUser)
            .where('aprovadoCrister', null)
            .where('dia', Dia)
            .where('mes', Mes)
            .where('ano', fim[0])
            //.where('art', null) // buscar onde a art seja ok 
            .select('*');
            console.log(resp)
            res = resp;
        } else if(fim[0] === ''){
            console.log('fim Vasio buscar com data inicial >>>', inicio);
            let Dia = parseInt(inicio[2]);// correção do valor remoção do 0 a esquerda;
            let Mes = parseInt(inicio[1]); // correção do  valor remoção de 0 a esquerda;
            console.log(Dia, Mes);
            
            let resp = await connection('calendario')
            .where('tokenUser', data.tokenUser)
            .where('aprovadoCrister', null)
            .where('dia', Dia)
            .where('mes', Mes)
            .where('ano', inicio[0])
            //.where('art',  null) // buscar onde a art seja ok 
            .select('*')
            console.log(resp)
            res = resp
        }  else {
            // buscar cronograma inteiro.
            console.log(data)
            console.log('busacr todo um cronograma', data);
            const [diaI, mesI, anoI] = data.inicio.split('-');
            const [diaF, mesF, anoF] = data.fim.split('-');

            // monta YYYY-MM-DD
            const dataInicio = `${anoI}-${mesI.padStart(2, '0')}-${diaI.padStart(2, '0')}`;
            const dataFim    = `${anoF}-${mesF.padStart(2, '0')}-${diaF.padStart(2, '0')}`;

            const resp = await connection('calendario')
                .where('tokenUser', data.tokenUser)
                .where('aprovadoCrister', null)
                //.where('art', null) // buscar onde a art seja ok 
                .andWhereRaw(
                // strftime format: garante '2025-05-09' mesmo que mes/dia sejam inteiros
                `strftime('%Y-%m-%d',
                    ano || '-' || printf('%02d', mes) || '-' || printf('%02d', dia)
                ) BETWEEN ? AND ?`,
                [dataInicio, dataFim]
                )
                .orderBy(['id']);
            console.log(resp,'this ')
            res = resp
        };   
        return res
    };

    //Buscar para a area de aprovação. cornogrma / publicação especifica.
    async buscarAprovacao(data: CalendarioDTO): Promise<object>{
        console.log(data);
        let res = {}; // retono da função
        // ano. mes, dia - formatação da data
        let inicio = data.inicio.split('-');
        let fim = data.fim.split('-');
        console.log(inicio[0],'<<<<< inicio')
        console.log(fim[0],'<<<< fim')
        if(inicio[0] === '' && fim[0] === ''){
            let resp = "não foi enviado uma data"
            res = resp
        }else if(inicio[0] === ''){
            console.log('inicio vazio', data)
            // buscar com a data de termino;
            let Dia = parseInt(fim[2]);// correção do valor remoção do 0 a esquerda;
            let Mes = parseInt(fim[1]); // correção do  valor remoção de 0 a esquerda;
            console.log(Dia, Mes)
            let resp = await connection('calendario').where('tokenUser', data.tokenUser)
            .where('aprovadoCrister', null)
            .where('dia', Dia)
            .where('mes', Mes)
            .where('ano', fim[0])
            .where('art', 'ok') // buscar onde a art seja ok 
            .select('*');
            console.log(resp)
            res = resp;
        } else if(fim[0] === ''){
            console.log('fim Vasio buscar com data inicial >>>', inicio);
            let Dia = parseInt(inicio[2]);// correção do valor remoção do 0 a esquerda;
            let Mes = parseInt(inicio[1]); // correção do  valor remoção de 0 a esquerda;
            console.log(Dia, Mes);
            
            let resp = await connection('calendario')
            .where('tokenUser', data.tokenUser)
            .where('aprovadoCrister', null)
            .where('dia', Dia)
            .where('mes', Mes)
            .where('ano', inicio[0])
            .where('art',  'ok') // buscar onde a art seja ok 
            .select('*')
            console.log(resp)
            res = resp
        }  else {
            // buscar cronograma inteiro.
            console.log(data)
            console.log('busacr todo um cronograma', data);
            const [diaI, mesI, anoI] = data.inicio.split('-');
            const [diaF, mesF, anoF] = data.fim.split('-');

            // monta YYYY-MM-DD
            const dataInicio = `${anoI}-${mesI.padStart(2, '0')}-${diaI.padStart(2, '0')}`;
            const dataFim    = `${anoF}-${mesF.padStart(2, '0')}-${diaF.padStart(2, '0')}`;

            const resp = await connection('calendario')
                .where('tokenUser', data.tokenUser)
                .where('aprovadoCrister', null)
                .where('art', 'ok') // buscar onde a art seja ok 
                .andWhereRaw(
                // strftime format: garante '2025-05-09' mesmo que mes/dia sejam inteiros
                `strftime('%Y-%m-%d',
                    ano || '-' || printf('%02d', mes) || '-' || printf('%02d', dia)
                ) BETWEEN ? AND ?`,
                [dataInicio, dataFim]
                )
                .orderBy(['id']);
            console.log(resp,'this ')
            res = resp
        };   
        return res
    };
    //solicitar aprovação interna time  :
    async solicitarAprovacaoTime(data: CalendarioDTO): Promise<object> {
        console.log(data,'aprovacao time');
        let res = 0
        let test = await connection('calendario')
        .where('dia', data.dia)
        .where('mes', data.mes)
        .where('ano', data.ano) 
        .where('tokenUser', data.tokenUser)
        .select('*');
        if(test.length === 0) {
            res += 0;
        } else{
            res = await connection('calendario').where('id', test[0].id).update("art", 'ok');
            //pegar dados do Cliente para colocar no body da notificação:
            let Cliente = await connection('cliente').where('token', data.tokenUser).select('*');
            console.log('cliente', Cliente);
            console.log('resposta',res);
            console.log('Cliente erro',Cliente)
            let empresa = Cliente[0].empresa;
            
            
            // disparar notificação somente para o responsavel. ou seja atraves do token do usuario vamos inviar essa notificação.
            // pegar dados dos funcionarios da empres que cuida do perfil do lead atual:
            let colaboradores =  await connection('colaborador').where('funcao', 'gestor').where('empresa', empresa);
            
            let insetDataNotification = {
                token: colaboradores[0].token,
                corpoNotification: `O conteudo da DATA: ${data.dia}/${data.mes}/${data.ano} do Cliente : ${Cliente[0].user} aguarda por sua aprovação.`,
                status: 'pendente'
            };
            let notificationRegisterAreaNotification  = await connection('notificationArea').insert(insetDataNotification);
            console.log('REgistrando notificação na area de notificação.', notificationRegisterAreaNotification);
            
            let notFicationIndivisdual = await connection('notifications').where('idUser', colaboradores[0].token).select('*')
            let cont = 0
            while(cont < notFicationIndivisdual.length){
                const subscription = {
                    endpoint: notFicationIndivisdual[cont].endPoint,
                    keys: {
                        p256dh: notFicationIndivisdual[cont].p256dh,
                        auth: notFicationIndivisdual[cont].auth
                    }
                    
                };
                WebPush.sendNotification(subscription, `O conteudo do Cliente: ${Cliente[0].user} - ${data.dia}/${data.mes}/${data.ano} aguarda por sua aprovação .`)
                .then(() => {
                    // Se a notificação for enviada, verificamos e registramos a assinatura
                    console.log("Mensaguem enviada");
                })
                .catch(error => {
                    console.error('Erro ao enviar notificação', error);
                });
                console.log('notificação para gestor');
                cont ++
            }
        }
        
        return{res}
    };
    // aprovar o material para o cliente.
    async aprovarParaCliente(data: CalendarioDTO): Promise<object> {
        console.log(data);
        let res = ''
        let test = await connection('calendario')
        .where('dia', data.dia)
        .where('mes', data.mes)
        .where('ano', data.ano)
        .where('art', 'ok') 
        .where('tokenUser', data.tokenUser)
        .select('*');
        console.log(test.length,'<><><>');
        if(test.length === 0) {
            res += 0;
        } else{
            res = await connection('calendario').where('id', test[0].id).update("aprovadoCrister",data.aprovadoCrister);
            //mandar notifificação para o usuário - conteudo do dia x aguarda aprovação.
            let Cliente = await connection('cliente').where('token', data.tokenUser).select('*');
            console.log('cliente', Cliente);
            console.log('resposta',res);
            console.log('Cliente erro',Cliente)
            let empresa = Cliente[0].empresa;
            
            
            
            // disparar notificação somente para o responsavel. ou seja atraves do token do usuario vamos inviar essa notificação.
            // contruindo o corpo da notificação do Cliente
            
            let insetDataNotification = {
                token: Cliente[0].token,
                corpoNotification: `Novos conteudos aguarda por sua aprovação.`,
                status: 'pendente'
            };
            
           
            let notificationRegisterAreaNotification  = await connection('notificationArea').insert(insetDataNotification);
            
            console.log('REgistrando notificação na area de notificação.', notificationRegisterAreaNotification);
            
            let notFicationIndivisdual = await connection('notifications').where('idUser', Cliente[0].token).select('*')
            
            let cont = 0
            while(cont < notFicationIndivisdual.length){
                const subscription = {
                    endpoint: notFicationIndivisdual[cont].endPoint,
                    keys: {
                        p256dh: notFicationIndivisdual[cont].p256dh,
                        auth: notFicationIndivisdual[cont].auth
                    }
                    
                };
                console.log(subscription)
                WebPush.sendNotification(subscription, `Novos conteudos aguarda por sua aprovação.`)
                .then(() => {
                    // Se a notificação for enviada, verificamos e registramos a assinatura
                    console.log("Mensaguem enviada");
                })
                .catch(error => {
                    console.error('Erro ao enviar notificação', error);
                });
                console.log('notificação para Editores o cliente');
                cont ++
            }
        }
        console.log(res,'<>')
        //  
        return{res}
    };
    //buscar material aprovado para o Cliente:
    async buscarAprovadoCliente(data: CalendarioDTO): Promise<object> {
        console.log('aprovados CLientes', data);
        let res = await connection('calendario')
        .where('tokenUser', data.tokenUser)
        .where("aprovadoCliente", null)
        .where('aprovadoCrister','aprovado')
        .select('*');
        console.log(res)

        return{res}
    };
    //solicitar ajuste - ajuste solicitado gestão  
    async solicitarAjuste(data: CalendarioDTO): Promise<object> {
        data
        let res = await connection('calendario')
        .where('tokenUser', data.tokenUser)
        .where('dia', data.dia)
        .where('mes', data.mes)
        .where('ano', data.ano)
        .update('ajusteCrister', data.ajusteCrister)
        //.update('ajusteCrister', data.ajusteCrister)
        // criar função paara enviar notificação para o social media responsavel.
        return{res}
    }
    //solicitação de ajuste vinda do clinte :
    async ajusteCliente(data :CalendarioDTO): Promise<object> {
        console.log('cliente ajuste');
        let res = await connection('calendario')
        .where('tokenUser', data.tokenUser)
        .where('dia', data.dia)
        .where('mes', data.mes)
        .where('ano', data.ano)
        .update('ajusteCliente', data.ajusteCliente)
        .update('aprovadoCrister', null)
        //.select('*');
        console.log(res)
        // enviar notifição ao social media responavel pelo clinte 
        return {res}        
    }
    // salvar nome do aruivo no banco de dados:
    async nameFile(data : CalendarioDTO): Promise<object>{
        let res = '';
        let validation = typeof(data.nomeArquivos);
        console.log(validation);
        console.log(validation === 'object')
        if(validation === 'object'){
            let publi = await connection('calendario')
            .where({
            dia: data.dia,
            mes: data.mes,
            ano: data.ano,
            formato: data.formato,
            tokenUser: data.tokenUser
            })
            .update({
                nomeArquivos: JSON.stringify(data.nomeArquivos)
            });
            res += publi;
        } else if( validation === 'string'){
            let publi = await connection('calendario')
            .where({
            dia: data.dia,
            mes: data.mes,
            ano: data.ano,
            formato: data.formato,
            tokenUser: data.tokenUser
            })
            .update({
                nomeArquivos: data.nomeArquivos
            });
            res += publi
        }        
        return{res}
    }
    // atualizando o tema da publicação:
    async updateTema(data: CalendarioDTO): Promise<object>{
        console.log(data);
        let res = await connection('calendario')
        .where('tokenUser', data.tokenUser)
        .where('dia', data.dia)
        .where('mes', data.mes)
        .where('ano', data.ano)
        .update('tema', data.tema)
        //.select('*')
        return{res}
    }
    // atualizar formato da publicação.
    async updateFormato(data: CalendarioDTO): Promise<object> {
        let res = await connection('calendario')
        .where('tokenUser', data.tokenUser)
        .where('dia', data.dia)
        .where('mes', data.mes)
        .where('ano', data.ano)
        .update('formato', data.formato)
        //.select('*')
        return{res}
    }
    // atualizando legenda da publicação:
    async updateLegenda(data: CalendarioDTO): Promise<object> {
        let res = await connection('calendario')
        .where('tokenUser', data.tokenUser)
        .where('dia', data.dia)
        .where('mes', data.mes)
        .where('ano', data.ano)
        .update('legenda', data.legenda)
        //.select('*')
        return{res}
    }
    // legenda Unica
    async Legenda(data: CalendarioDTO): Promise<object>{
        await connection('calendario').where('id', data.id).update('legenda', data.legenda);
        return{res :'salva'}
    };
    // funcionalidade para aprovar a publicação - Cliente + automação da publicação.
    async aprovacaoCliente(data: CalendarioDTO): Promise<any> {
        // 1) Atualiza o registro
        const response = await connection('calendario')
            .where('id', data.id)
            .update({ aprovadoCliente: 'aprovado' });

        // 5) Retorna tudo*/
        return {res: response};
    }

    // funcionalidade para cria um token no banco de dados:
    async createToken(data: CalendarioDTO): Promise<object>{
        console.log('DATALMITE', data);
        let res = await connection('automacao').select('*');
        if(res.length > 0){
            let update = await connection('automacao').where('id', res[0].id).update('token', data.token).update('datalimite',data.datalimite);
            return update;
        }else {
            let insert = await connection('automacao').insert(data);
            return insert
        }
    }
}