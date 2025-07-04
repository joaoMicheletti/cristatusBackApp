import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { console } from 'inspector';
import connection from 'src/database/connection';
@Injectable()
export class Automacao {
  private readonly logger = new Logger(Automacao.name);

  @Cron('40 * * * * *')  async handleCron() {
    this.logger.debug('Called when the current second is 45');
    const data = new Date();
    const dia = data.getDate();// dia
    const mes = data.getMonth() + 1;//mes ssomar com +1 para deichar a foramtação correata
    const ano = data.getFullYear();// ano
    const hora = data.getHours(); // hopra atual
    const publicao = await connection("calendario")
    .where('dia', dia).where('mes', mes).where('ano', ano)
    .where('aprovadoCliente', 'aprovado')
    .where('publicado', null)// buscar publicações  com base na  data de hoje e hora atual.
    const chave = await connection('automacao').select('token')

    // fazer um loop para cada publicação encontrada. 
    let cont = 0;
    while (cont < publicao.length){
        console.log('aqui', publicao[cont].tokenUser);
        // se a hora da publicação for null na tabela do Cliente efetuar a publicação às 09:00
        let horaUser = await connection('cliente').where('token', publicao[cont].tokenUser);// horario estrategico do cliente.
        // verificar se o horario d na table acilente é Null, se for null publicar na hora alternitica.
        if(horaUser[0].horario === null){
            this.logger.debug('aqui é null', horaUser)
            // se for null efetuar a puyblicação com o horario definido por padrão na criação do calendario.
            // verificar se ahora do processamento é a mesma da publicação.
            if(hora === 18 /*parseInt(publicao[cont].hora)*/){
                this.logger.debug(hora)
                // verificar o formato da publicação
                if(publicao[cont].formato === 'carrossel'){
                    // efetuar publicação no formato de carrossel
                } else {
                    this.logger.debug('estatico/video')
                    // efetuar apublicação no formato de video ou estatico.
                    let url: string = `https://graph.facebook.com/v14.0/${horaUser[0].idPerfil}/media?image_url=https://cristatusbackapp-production.up.railway.app/image/${publicao[cont].nomeArquivos}&caption=${encodeURIComponent(publicao[cont].legenda)}&access_token=${chave[0].token}`
                    // efetuar a criação do container :
                    const resp = await fetch(url, { method: 'POST' });
                    this.logger.debug(resp)
                    // resposta da solisitação - paese Json
                    let respostaMetaConteiner = await resp.json();
                    // se ocorreu tudo bem  a resposta contera um id 
                    if(respostaMetaConteiner.id > 0){
                        // efetuar a publicação com o id do container:
                        let urlCintainerID: string = `https://graph.facebook.com/v14.0/${horaUser[0].idPerfil}/media_publish?creation_id=${respostaMetaConteiner.id}&access_token=${chave[0].token}`;
                        const respostaPublicacao = await fetch(urlCintainerID, { method: 'POST' });
                        this.logger.debug('aque a resposta da publicação.', respostaPublicacao)
                    }
                };                
            } else {

                this.logger.debug('não esta na hora de efetuar apublicação', chave[0].token);
            };
        } else  { // se nao for nulo efetuar a publicação no horario definido na tabel cliente 
            // verificar se  esta na hora de efetuar apublicação;
            if(hora === parseInt(horaUser[0].hora)){
                // verificar o formato da publicação:
                if(publicao[cont].formato === 'carrossel'){

                } else {
                    //efetuar a publicação no formato de video e estatico.
                }
                // efetuar apublicação.
            } else {
                this.logger.debug('Não esta na hora de efetuar apublicação.');
            }
        }
        this.logger.debug(horaUser[0].horario === null)   
          
        
        cont+= 1;
    };    
  }
}