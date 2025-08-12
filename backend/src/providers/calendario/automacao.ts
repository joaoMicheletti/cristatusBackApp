import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { console } from 'inspector';
import connection from 'src/database/connection';
import axios from 'axios';
const ffmpeg = require('fluent-ffmpeg');
@Injectable()
export class Automacao {
  private readonly logger = new Logger(Automacao.name);
 //@Cron('0 */5 * * * *')  async handleCron() {
@Cron('10 * * * * *')  async handleCron() {
    
    const data = new Date();
    const dia = data.getDate();// dia
    const mes = data.getMonth() + 1;//mes ssomar com +1 para deichar a foramtação correata
    const ano = data.getFullYear();// ano
    const hora = data.getHours(); // hora atual
    const publicao = await connection("calendario")
    .where('dia', dia).where('mes', mes).where('ano', ano)
    .where('aprovadoCliente', 'aprovado')
    .where('processo', null)// definir um campo para previnir que inicie o processo de publicação 2X
    .where('publicado', null)// buscar publicações  com base na  data de hoje e hora atual.
    const chave = await connection('automacao').select('token')
    this.logger.debug('Called when the current second is 45');
    this.logger.debug('hora', hora,'dia:',dia," mes:", mes, " ano:", ano)
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
            this.logger.debug('hora do servidor.::::', hora)
            this.logger.debug('hora da publicação na culçuna da publicação hora definida autoimaticamente.',publicao[cont].hora)
            this.logger.debug('verificação de hora ',hora === parseInt(horaUser[0].horario))
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
                } else if(publicao[cont].formato === 'video'){
                    this.logger.debug('videoooooo');
                    // atualizar o campo processo no banco de dados para evitar iniciar o segundo processamenteo da publicação.
                    let updateProcesso = await connection('calendario').where('id', publicao[cont].id).update('processo', 'processado');
                    this.logger.debug('Campo processo Ataulizado,',updateProcesso);
                    // antes de crair o container vamos processar o video.
                    this.logger.debug('aqui é o processod e publição de video!')
                    /*?async function corrigirVideo(inputPath: string, outputPath: string): Promise<void> {
                        console.log('Processando vídeo:', inputPath);
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
                            .outputOptions([
                                '-pix_fmt yuv420p',
                                '-b:v 8000k',
                                '-maxrate 8500k',
                                '-bufsize 10000k',
                                '-movflags +faststart',
                                '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2'
                            ])
                            .on('end', () => {
                                console.log('Finalizado com sucesso:', outputPath);
                                resolve();
                            })
                            .on('error', err => {
                                this.logger.debug('Erro ao processar vídeo:', err);
                                reject(new Error('Erro ao processar vídeo: ' + err.message));
                            })
                            .save(outputPath);
                        });
                    }
                    

                    this.logger.debug('processando o Vídeo...');
                    await corrigirVideo(
                        `src/public/${publicao[cont].nomeArquivos}`,
                        `src/public/processed-${publicao[cont].nomeArquivos}`
                    );/** */

                    //testar com calma a publçicação de videos com o facebbok 
                    //upload_type– Defina como resumable, se estiver criando uma sessão de upload retomável para um arquivo de vídeo grande
                    
                    ///cirando container
                    let videoUrl = `https://www.acasaprime1.com.br/image/${publicao[cont].nomeArquivos}`
                    const testVideo = await axios.head(videoUrl);
                    if (testVideo.status !== 200) {
                    throw new Error('URL de vídeo inacessível');
                    }   
                    this.logger.debug(`resposta da URL do Videos`,testVideo.status)
                    
                    const createRes = await axios.post(
                        `https://graph.facebook.com/v23.0/${horaUser[0].idInsta}/media` ,
                        new URLSearchParams({
                            upload_type: 'resumable',
                            media_type: 'REELS',
                            video_url: `https://www.acasaprime1.com.br/image/${publicao[cont].nomeArquivos}`,
                            share_to_feed: 'true',
                            caption: publicao[cont].legenda,
                            access_token: chave[0].token,
                            thumb_offset: '3'
                            
                        }),
                    );
                    
                    this.logger.debug('📦 Container criado com sucesso:');
                    this.logger.debug(JSON.stringify(createRes.data, null, 2));
                    const containerId = createRes.data.id;
                    if (!containerId) {
                        this.logger.debug('❌ Container ID não retornado');
                        return;
                    };


                    /** Tenta HEAD; se falhar, usa GET com Range para obter o tamanho via Content-Range */
                    async function getRemoteFileSize(url: string): Promise<number> {
                        // 1) HEAD
                        try {
                            const r = await axios.head(url, { maxRedirects: 5, timeout: 15000 });
                            const len = r.headers["content-length"];
                            if (len && !isNaN(Number(len))) return Number(len);
                        } catch {}

                        // 2) GET com Range (1 byte)
                        const r2 = await axios.get(url, {
                            headers: { Range: "bytes=0-0" },
                            validateStatus: s => (s >= 200 && s < 300) || s === 206,
                            responseType: "arraybuffer",
                            maxRedirects: 5,
                            timeout: 20000,
                        });
                        const cr = r2.headers["content-range"]; // ex: "bytes 0-0/1234567"
                        if (!cr) throw new Error("Sem Content-Range; servidor não informa tamanho.");
                        const total = cr.split("/")[1];
                        const size = Number(total);
                        if (!size || isNaN(size)) throw new Error("Content-Range inválido.");
                        return size;
                    };

                    // 1) tamanho do arquivo
                    const size = await getRemoteFileSize(videoUrl);
                    if (!size || size <= 0) throw new Error("Tamanho do arquivo inválido.");
                    this.logger.debug('Tamanho do aquivo em bites',size)

                    try {
                        const resp = await axios.post(
                        `https://rupload.facebook.com/ig-api-upload/v23.0/${containerId}`,
                        null,
                        {
                            headers: {
                            Authorization: `OAuth ${chave[0].token}`,
                            offset: "0",
                            file_size: String(size),
                            file_url: videoUrl,
                            },
                            maxBodyLength: Infinity,
                            timeout: 60000,
                            validateStatus: s => s === 200 || s === 201,
                        }
                        );
                        this.logger.debug('REsposta do Try',resp)
                    } catch (err: any) {
                        // Logs úteis para debugar
                       this.logger.debug(err)
                    }


                    /*?
                    let attempts = 0;
                    while (attempts < 20) {
                        this.logger.debug(`Lopinkg, ${attempts}`)
                        const statusRes = await axios.get(`https://graph.facebook.com/v23.0/${containerId}`, {
                            params: { fields: 'status', access_token: chave[0].token }
                        });

                        if (statusRes.data.status === 'FINISHED'){
                            this.logger.debug('Finished')
                            break;
                        } 
                        if (statusRes.data.status === 'ERROR'){
                            this.logger.debug('erro ao processar video')
                            throw new Error('Erro no vídeo');

                        } 
                        await new Promise(r => setTimeout(r, 5000)); // espera 5s
                        attempts++;
                    }
                    /*
                    let C = 0;
                    while(C === 0){
                        const statusRes = await axios.get(
                        `https://graph.facebook.com/v23.0/${containerId}`,
                        {
                            params: {
                            fields: 'status',
                            access_token: chave[0].token
                            }
                        }
                        );
                        this.logger.debug(statusRes.data.status)
                        if(statusRes.data.status ==='In Progress: Media is still being processed.'){
                            C+=0
                        }else{
                            C +=1;
                        }

                    }
                    
                    
                    let publication = await axios.post(
                    `https://graph.facebook.com/v23.0/${horaUser[0].idInsta}/media_publish`,
                    new URLSearchParams({
                        creation_id: containerId,
                        access_token: chave[0].token
                    }),
                    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                    );
                    this.logger.debug(publication)

                    
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
                    */
                }
            }
        }
        cont+= 1;
    };
    this.logger.debug('nada encontrado para ser publicado.')
  }
}
