import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { console } from 'inspector';
import connection from 'src/database/connection';
import axios from 'axios';
const ffmpeg = require('fluent-ffmpeg');
@Injectable()
export class Automacao {
  private readonly logger = new Logger(Automacao.name);
  @Cron('10 * * * * *')  async handleCron() {
    
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
    this.logger.debug('Called when the current second is 45');
    // fazer um loop para cada publicação encontrada. 
    this.logger.debug(publicao)
    let cont = 0;
    while (cont < publicao.length){
        this.logger.debug("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
        this.logger.debug('aqui', publicao[cont].tokenUser);
        // se a hora da publicação for null na tabela do Cliente efetuar a publicação às 09:00
        let horaUser = await connection('cliente').where('token', publicao[cont].tokenUser);// horario estrategico do cliente.
        // verificar se o horario d na table acilente é Null, se for null publicar na hora alternitica.
        this.logger.debug(horaUser)
        this.logger.debug(horaUser[0].horario)
        if(horaUser[0].horario === null){
            this.logger.debug('aqui é null', horaUser)
            // se for null efetuar a puyblicação com o horario definido por padrão na criação do calendario.
            // verificar se ahora do processamento é a mesma da publicação.
            if(hora === parseInt(publicao[cont].hora)){
                this.logger.debug(hora)
                // verificar o formato da publicação
                if(publicao[cont].formato === 'carrossel'){
                    // efetuar publicação no formato de carrossel
                } else if(publicao[cont].formato === 'estatico') {
                    this.logger.debug('estatico')
                    // efetuar apublicação no formato de video ou estatico.
                    let url: string = `https://graph.facebook.com/v23.0/${horaUser[0].idInsta}/media?image_url=https://www.acasaprime1.com.br/image/${publicao[cont].nomeArquivos}&caption=${encodeURIComponent(publicao[cont].legenda)}&access_token=${chave[0].token}`
                    // efetuar a criação do container :
                    this.logger.debug(url)
                    const resp = await fetch(url, { method: 'POST' });
                    this.logger.debug(resp)
                    // resposta da solisitação - paese Json
                    let respostaMetaConteiner = await resp.json();
                    // se ocorreu tudo bem  a resposta contera um id 
                    if(respostaMetaConteiner.id > 0){
                        // efetuar a publicação com o id do container:
                        let urlCintainerID: string = `https://graph.facebook.com/v23.0/${horaUser[0].idPerfil}/media_publish?creation_id=${respostaMetaConteiner.id}&access_token=${chave[0].token}`;
                        const respostaPublicacao = await fetch(urlCintainerID, { method: 'POST' });
                        this.logger.debug('aque a resposta da publicação.', respostaPublicacao)
                        // atualizar o campo publicado para nao repiutir a publicação 
                        let update = await connection('calendario').where('id', publicao[cont].id).update('publicado', 'publicado');
                        this.logger.debug(update)
                    }
                } else if(publicao[cont].formato === 'video'){0
                    this.logger.debug('videoooooo');
                    // antes de crair o container vamos processar o video.
                    async function corrigirVideo(inputPath: string, outputPath: string): Promise<void> {
                        if (!inputPath || !outputPath) {
                            throw new Error('Caminhos de input ou output estão indefinidos!');
                        }

                        return new Promise((resolve, reject) => {
                            ffmpeg(inputPath)
                            .videoCodec('libx264')
                            .audioCodec('aac')
                            .audioChannels(2)
                            .audioFrequency(44100)
                            .audioBitrate('128k')
                            .size('1080x1920')
                            .aspect('9:16')
                            .outputOptions('-pix_fmt yuv420p')
                            .on('end', () => resolve())
                            .on('error', err => reject(new Error('Erro ao processar vídeo: ' + err.message)))
                            .save(outputPath);
                        });
                    };
                    this.logger.debug('processando o Vídeo...');
                    await corrigirVideo(
                        `src/public/${publicao[cont].nomeArquivos}`,
                        `src/public/processed-${publicao[cont].nomeArquivos}`
                    );
                    ///cirando container

                    const createRes = await axios.post(
                        `https://graph.facebook.com/v23.0/${horaUser[0].idPerfil}/media` ,
                        new URLSearchParams({
                            media_type: 'REELS',
                            video_url: `https://www.acasaprime1.com.br/image/processed-${publicao[cont].nomeArquivos}`,
                            caption: publicao[cont].legenda,
                            access_token: chave[0].token,
                        }),
                    );

                    this.logger.debug('📦 Container criado com sucesso:');
                    this.logger.debug(JSON.stringify(createRes.data, null, 2));
                    const containerId = createRes.data.id;
                    if (!containerId) {
                        this.logger.debug('❌ Container ID não retornado');
                        return;
                    };
                    // 2. Esperar processamento (Instagram recomenda 30s~60s)
                    this.logger.debug('⏳ Aguardando 60 segundos para o processamento do vídeo...');
                    await new Promise((resolve) => setTimeout(resolve, 30000));

                    // 3. Publicar o vídeo (Reel)
                    const publishRes = await axios.post(
                        `https://graph.facebook.com/v23.0/${horaUser[0].idPerfil}/media_publish`,
                        new URLSearchParams({
                            creation_id: containerId,
                            access_token: chave[0].token,
                        }),
                    );
                    this.logger.debug(publishRes);

                }
            } else {
                this.logger.debug('Não está na hora de efetuar apublicação desse Post');
            }
        } else {
            this.logger.debug('aqui não é null', horaUser)
            // se for null efetuar a puyblicação com o horario definido por padrão na criação do calendario.
            // verificar se ahora do processamento é a mesma da publicação.
            this.logger.debug(hora)
            this.logger.debug(publicao[cont].hora)
            this.logger.debug(hora === parseInt(horaUser[0].horario))
            if(hora === parseInt(horaUser[0].horario)){
                this.logger.debug('criar container')
                // verificar o formato da publicação
                if(publicao[cont].formato === 'carrossel'){
                    // efetuar publicação no formato de carrossel
                } else if(publicao[cont].formato === 'estatico') {
                    this.logger.debug('estaticoooo')
                    this.logger.debug(horaUser[0]);
                    // efetuar apublicação no formato de video ou estatico.
                    let url: string = `https://graph.facebook.com/v23.0/${horaUser[0].idInsta}/media?image_url=https://www.acasaprime1.com.br/image/${publicao[cont].nomeArquivos}&caption=${encodeURIComponent(publicao[cont].legenda)}&access_token=${chave[0].token}`
                    // efetuar a criação do container :
                    this.logger.debug(url)
                    const resp = await fetch(url, { method: 'POST' });
                    // resposta da solisitação - paese Json
                    let respostaMetaConteiner = await resp.json();
                    // se ocorreu tudo bem  a resposta contera um id 
                    this.logger.debug(respostaMetaConteiner.id)
                    if(respostaMetaConteiner.id > 0){
                        // efetuar a publicação com o id do container:
                        let urlCintainerID: string = `https://graph.facebook.com/v23.0/${horaUser[0].idInsta}/media_publish?creation_id=${respostaMetaConteiner.id}&access_token=${chave[0].token}`;
                        const respostaPublicacao = await fetch(urlCintainerID, { method: 'POST' });
                        this.logger.debug('aque a resposta da publicação.', respostaPublicacao)
                        // atualizar o campo publicado para nao repiutir a publicação 
                        let update = await connection('calendario').where('id', publicao[cont].id).update('publicado', 'publicado');
                        this.logger.debug(update)
                    }
                } else if(publicao[cont].formato === 'video'){0
                    this.logger.debug('videoooooo');
                    // antes de crair o container vamos processar o video.
                    async function corrigirVideo(inputPath: string, outputPath: string): Promise<void> {
                        if (!inputPath || !outputPath) {
                            throw new Error('Caminhos de input ou output estão indefinidos!');
                        }

                        return new Promise((resolve, reject) => {
                            ffmpeg(inputPath)
                            .videoCodec('libx264')
                            .audioCodec('aac')
                            .audioChannels(2)
                            .audioFrequency(44100)
                            .audioBitrate('128k')
                            .size('1080x1920')
                            .aspect('9:16')
                            .outputOptions('-pix_fmt yuv420p')
                            .on('end', () => resolve())
                            .on('error', err => reject(new Error('Erro ao processar vídeo: ' + err.message)))
                            .save(outputPath);
                        });
                    };
                    this.logger.debug('processando o Vídeo...');
                    await corrigirVideo(
                        `src/public/${publicao[cont].nomeArquivos}`,
                        `src/public/processed-${publicao[cont].nomeArquivos}`
                    );
                    ///cirando container

                    const createRes = await axios.post(
                        `https://graph.facebook.com/v23.0/${horaUser[0].idPerfil}/media` ,
                        new URLSearchParams({
                            media_type: 'REELS',
                            video_url: `http://ec2-54-233-243-115.sa-east-1.compute.amazonaws.com:3333/image/processed-${publicao[cont].nomeArquivos}`,
                            caption: publicao[cont].legenda,
                            access_token: chave[0].token,
                        }),
                    );

                    this.logger.debug('📦 Container criado com sucesso:');
                    this.logger.debug(JSON.stringify(createRes.data, null, 2));
                    const containerId = createRes.data.id;
                    if (!containerId) {
                        this.logger.debug('❌ Container ID não retornado');
                        return;
                    };
                    // 2. Esperar processamento (Instagram recomenda 30s~60s)
                    this.logger.debug('⏳ Aguardando 60 segundos para o processamento do vídeo...');
                    await new Promise((resolve) => setTimeout(resolve, 30000));

                    // 3. Publicar o vídeo (Reel)
                    const publishRes = await axios.post(
                        `https://graph.facebook.com/v23.0/${horaUser[0].idPerfil}/media_publish`,
                        new URLSearchParams({
                            creation_id: containerId,
                            access_token: chave[0].token,
                        }),
                    );
                    this.logger.debug(publishRes);
                }
            }
        }
        cont+= 1;
    }; 
  }
}
