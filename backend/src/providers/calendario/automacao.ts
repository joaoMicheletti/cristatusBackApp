import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import connection from 'src/database/connection';
import axios from 'axios';
const ffmpeg = require('fluent-ffmpeg');
@Injectable()
export class Automacao {
  private readonly logger = new Logger(Automacao.name);
 //@Cron('0 */5 * * * *')  async handleCron() {
//@Cron('0 */3 * * * *') async handleCron() {
@Cron('10 * * * * *') async handleCron() {
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
                    let updateProcesso = await connection('calendario').where('id', publicao[cont].id).update('processo', 'processado');
                    this.logger.debug('Campo processo Ataulizado,',updateProcesso);
                    // efetuar publicação no formato de carrossel
                    // separar o nome dos arquivos, no campo Nome arquivos.
                    let nomeArquivos = publicao[cont].nomeArquivos;
                    // removendo caracteres:
                    let removeCaracteres = nomeArquivos.replace(/[\[\]"\/\\]/g, '');
                    // separando o nome dos arquivos Por (,);
                    let listaLimpa = removeCaracteres.split(',');
                    console.log(listaLimpa, listaLimpa.length);
                    let contLista = 0;
                    const childIds: string[] = []; // lista de containers
                    while (contLista < listaLimpa.length){
                        // verificar qual o tipo do arquivo, com base na estenção do arquivo.mp4 para vieos os demais img
                        // se for video processaremos o video para garantie que esteja nos padroes aceitaveis pelo meta.

                        if(listaLimpa[contLista].includes('.mp4')){
                            // criando container de video filho para um carossel.
                            // processando video, vamos garantir que ele esteja nos padroes aceitaveis.
                            async function corrigirVideo(inputPath: string, outputPath: string): Promise<void> {
                                if (!inputPath || !outputPath) {
                                    throw new Error('Caminhos de input ou output estão indefinidos!');
                                }

                                // timeout de segurança (ex.: 10 minutos)
                                const TIMEOUT_MS = 10 * 60 * 1000;
                                let finished = false;

                                return new Promise((resolve, reject) => {
                                    const timer = setTimeout(() => {
                                    if (!finished) {
                                        reject(new Error('FFmpeg timeout ao processar o vídeo.'));
                                    }
                                    }, TIMEOUT_MS);

                                    ffmpeg(inputPath)
                                    .videoCodec('libx264')
                                    .outputOptions([
                                        '-r 30',                    // FPS fixo (30 é mais seguro)
                                        '-g 60',                    // GOP ~2s
                                        '-pix_fmt yuv420p',
                                        '-profile:v high',
                                        '-level 4.1',
                                        '-b:v 8000k',
                                        '-maxrate 8500k',
                                        '-bufsize 10000k',
                                        '-movflags +faststart',
                                        '-vf',
                                        'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2'
                                    ])
                                    .audioCodec('aac')
                                    .audioChannels(2)
                                    .audioFrequency(44100)
                                    .audioBitrate('128k')
                                    .on('progress', p => {
                                        // opcional: logar progresso
                                        // console.log(`ffmpeg: ${p.frames} frames`);
                                    })
                                    .on('end', () => {
                                        finished = true;
                                        clearTimeout(timer);
                                        resolve();
                                    })
                                    .on('error', (err) => {
                                        finished = true;
                                        clearTimeout(timer);
                                        reject(err);
                                    })
                                    .save(outputPath);
                                });
                            };
                            // chamando a função para corrigir o video.
                            this.logger.debug('processando o Vídeo para o container filho...');
                            await corrigirVideo(
                                `src/public/${listaLimpa[contLista]}`,
                                `src/public/processed-${listaLimpa[contLista]}`
                            );
                            //processamos o video, vamos aguardar 1 minutos para que a versçao processada esteja disponivel.
                            await new Promise(r => setTimeout(r, 60000 * 1));
                            // criar o container com o video processado:
                            console.log(`https://www.acasaprime1.com.br/image/processed-${listaLimpa[contLista]}`)
                            const createRes = await axios.post(
                                `https://graph.facebook.com/v23.0/${horaUser[0].idInsta}/media`,
                                new URLSearchParams({
                                    is_carousel_item: 'true',
                                    video_url: `https://www.acasaprime1.com.br/image/processed-${listaLimpa[contLista]}`,
                                    access_token: chave[0].token,
                                }),
                                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                            );
                            this.logger.debug('Create Container filho video carrossel',createRes.data.id)
                            childIds.push(createRes.data.id);
                            contLista +=1;
                        } else {
                            // chegando aqui criaremos o container como uma imagem.
                            const imageUrl = `https://www.acasaprime1.com.br/image/${encodeURIComponent(listaLimpa[contLista])}`;
                            const createChild = await axios.post(
                            `https://graph.facebook.com/v23.0/${horaUser[0].idInsta}/media`,
                            new URLSearchParams({
                                image_url: imageUrl,           // URL pública direta
                                is_carousel_item: 'true',
                                access_token: chave[0].token,
                            }), {
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                            }
                            );
                            // ID do filho:
                            childIds.push(createChild.data.id);
                            contLista +=1;
                        };
                    };
                    this.logger.debug('lista de containers criado', childIds);
                } else if(publicao[cont].formato === 'estatico') {
                    this.logger.debug('estaticoooo')
                    this.logger.debug(horaUser[0]);
                    let updateProcesso = await connection('calendario').where('id', publicao[cont].id).update('processo', 'processado');
                    this.logger.debug('Campo processo Ataulizado,',updateProcesso);
                    // efetuar a criação do container 
                    let url: string = `https://graph.facebook.com/v23.0/${horaUser[0].idInsta}/media?image_url=https://www.acasaprime1.com.br/image/${publicao[cont].nomeArquivos}&caption=${encodeURIComponent(publicao[cont].legenda)}&access_token=${chave[0].token}`
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
                    async function corrigirVideo(inputPath: string, outputPath: string): Promise<void> {
                        if (!inputPath || !outputPath) {
                            throw new Error('Caminhos de input ou output estão indefinidos!');
                        }

                        // timeout de segurança (ex.: 10 minutos)
                        const TIMEOUT_MS = 10 * 60 * 1000;
                        let finished = false;

                        return new Promise((resolve, reject) => {
                            const timer = setTimeout(() => {
                            if (!finished) {
                                reject(new Error('FFmpeg timeout ao processar o vídeo.'));
                            }
                            }, TIMEOUT_MS);

                            ffmpeg(inputPath)
                            .videoCodec('libx264')
                            .outputOptions([
                                '-r 30',                    // FPS fixo (30 é mais seguro)
                                '-g 60',                    // GOP ~2s
                                '-pix_fmt yuv420p',
                                '-profile:v high',
                                '-level 4.1',
                                '-b:v 8000k',
                                '-maxrate 8500k',
                                '-bufsize 10000k',
                                '-movflags +faststart',
                                '-vf',
                                'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2'
                            ])
                            .audioCodec('aac')
                            .audioChannels(2)
                            .audioFrequency(44100)
                            .audioBitrate('128k')
                            .on('progress', p => {
                                // opcional: logar progresso
                                // console.log(`ffmpeg: ${p.frames} frames`);
                            })
                            .on('end', () => {
                                finished = true;
                                clearTimeout(timer);
                                resolve();
                            })
                            .on('error', (err) => {
                                finished = true;
                                clearTimeout(timer);
                                reject(err);
                            })
                            .save(outputPath);
                        });
                        }
                    
                    // chamando a função para corrigir o video.
                    this.logger.debug('processando o Vídeo...');
                    await corrigirVideo(
                        `src/public/${publicao[cont].nomeArquivos}`,
                        `src/public/processed-${publicao[cont].nomeArquivos}`
                    );
                    

                    //log para mostrar que ja finalizou o processo de correeção do video.
                    this.logger.debug('processo de correção do video finalizado, verificando disponibilidade do video!')

                    
                    // veirificando a disponibilidsade do video.
                    /*let negativa = 0;
                    while(true){
                        let videoUrl = `https://www.acasaprime1.com.br/image/processed-${publicao[cont].nomeArquivos}`
                        const testVideo = await axios.head(videoUrl);
                        if (testVideo.status !== 200) {
                            negativa += 1;
                            throw new Error(`URL de vídeo inacessível:${negativa}`);
                        } else {
                            this.logger.debug(`resposta da requisição onde verificamos a integridade do video:`,testVideo.status);
                            await new Promise(r => setTimeout(r, 60000)); // espera 1 minuto;
                            break;
                        }
                    }*/
                       
                    
                    
                    //cirando container
                    const createRes = await axios.post(
                        `https://graph.facebook.com/v23.0/${horaUser[0].idInsta}/media` ,
                        new URLSearchParams({
                            media_type: 'REELS',
                            video_url: `https://www.acasaprime1.com.br/image/processed-${publicao[cont].nomeArquivos}`,
                            share_to_feed: 'true',
                            caption: `${encodeURIComponent(publicao[cont].legenda)}`,
                            access_token: chave[0].token,
                            thumb_offset: '3'
                            
                        }),
                    );
                    this.logger.debug('Create Container Reels',createRes.data.id)

                    let containerId = createRes.data.id;
                    // verificando a disponibilidade do container
                    let Verification = 0;
                    let n = 3;
                    while (true) {
                        this.logger.debug(`Verificando o status da criação do container`);
                        await new Promise(r => setTimeout(r, 60000 * n)); // espera 3 minutos para verificar o status da CRiação do Container 
                        const statusRes = await axios.get(`https://graph.facebook.com/v23.0/${containerId}`, {
                            params: { fields: 'status', access_token: chave[0].token }
                        });
                        this.logger.debug('acompanhamento do status do container', statusRes.data);

                        if (statusRes.data.status === 'Finished: Media has been uploaded and it is ready to be published.'){
                            this.logger.debug('Finished')
                            Verification += 1;
                            break;
                        } 
                        if (statusRes.data.status === 'ERROR'){
                            let updateProcesso = await connection('calendario').where('id', publicao[cont].id).update('processo', null);
                            // enviar notificação do erro ao procesar video aos sociais medias e gestor de projetos.
                            this.logger.debug('erro ao processar video');
                        };
                    };                    
                    // publicação de Reels :
                    if(Verification > 0){
                        let publication = await axios.post(
                        `https://graph.facebook.com/v23.0/${horaUser[0].idInsta}/media_publish`,
                        new URLSearchParams({
                            creation_id: containerId,
                            access_token: chave[0].token
                        }),
                        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
                        );
                        this.logger.debug(publication);
                    }else {
                        this.logger.debug('O material noa pode ser publicado');
                    };                
                };
            };
        };
        cont+= 1;
    };
    this.logger.debug('nada encontrado para ser publicado.')
  }
}
