import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { console } from 'inspector';
import connection from 'src/database/connection';
import axios from 'axios';
import { URLSearchParams } from 'url';
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
    this.logger.debug(hora === 0);

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
            if(hora === 0 /*parseInt(publicao[cont].hora)*/){
                this.logger.debug(hora)
                // verificar o formato da publicação
                if(publicao[cont].formato === 'carrossel'){
                    // efetuar publicação no formato de carrossel
                } else if(publicao[cont].formato === 'estatico') {
                    this.logger.debug('estatico')
                    // efetuar apublicação no formato de video ou estatico.
                    let url: string = `https://graph.facebook.com/v23.0/${horaUser[0].idPerfil}/media?image_url=https://cristatusbackapp-production.up.railway.app/image/${publicao[cont].nomeArquivos}&caption=${encodeURIComponent(publicao[cont].legenda)}&access_token=${chave[0].token}`
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
                    const containerRes = await axios.post(
                    `https://graph.facebook.com/v23.0/${horaUser[0].idPerfil}/media`,
                    null,
                    {
                        params: {
                        media_type: 'REELS',
                        upload_type: 'resumable',
                        caption: publicao[cont].legenda,
                        access_token: chave[0].token,
                        },
                    }
                    );
                    this.logger.debug(containerRes)
                    const containerId = containerRes.data.id;
                    const uploadUri = containerRes.data.uri;
                    this.logger.debug('Contêiner criado:', containerId);
                    // 2. Obter tamanho do vídeo de forma segura
                    const videoUrl = `https://cristatusbackapp-production.up.railway.app/image/${publicao[cont].nomeArquivos}`;

                    let fileSize: any = '';
                    try {
                        const headResponse = await axios.head(videoUrl);
                        fileSize = headResponse.headers['content-length'] || headResponse.headers['Content-Length'];
                    } catch (err) {
                        this.logger.warn('Axios HEAD falhou, tentando fallback com fetch...');
                        const fallbackResp = await fetch(videoUrl, { method: 'HEAD' });
                        fileSize = fallbackResp.headers.get('content-length');
                    }
                    if (!fileSize) {
                        throw new Error('Não foi possível obter o tamanho do vídeo (Content-Length). Verifique se o servidor fornece esse cabeçalho.');
                    }
                    // 3. Upload do vídeo
                    const ruploadHeaders = {
                        Authorization: `OAuth ${chave[0].token}`,
                        offset: '0',
                        'file_size': fileSize,
                        'file_url': videoUrl,
                    };
                    const uploadResp = await axios.post(uploadUri, null, { headers: ruploadHeaders });

                    if (!uploadResp.data.success) {
                        throw new Error('Erro no upload do vídeo.');
                    }
                    console.log('Upload concluído:', uploadResp.data);

                    // 4. Aguardar processamento
                    let status = '';
                    let tentativas = 0;
                    do {
                    tentativas++;
                    const statusResp = await axios.get(
                        `https://graph.facebook.com/v23.0/${containerId}`,
                        {
                        params: {
                            fields: 'status_code',
                            access_token: chave[0].token,
                        },
                        }
                    );
                    status = statusResp.data.status_code;
                    console.log(`Tentativa ${tentativas}: status = ${status}`);
                    if (status !== 'FINISHED') {
                        await new Promise((res) => setTimeout(res, 3000));
                    }
                    } while (status !== 'FINISHED' && tentativas < 10);

                    if (status !== 'FINISHED') {
                    console.error('O vídeo não foi processado a tempo.');
                    return;
                    }
                    // 5. Publicar o conteúdo
                    const publishResp = await axios.post(
                    `https://graph.facebook.com/v23.0/${horaUser[0].idPerfil}/media_publish`,
                    null,
                    {
                        params: {
                        creation_id: containerId,
                        access_token: chave[0].token,
                        },
                    }
                    );

                    console.log('Resultado da publicação:', publishResp.data);
                }
            } else {
                this.logger.debug('nao esta na hora de efetuar apublicvação desse post');
            }
        }
        cont+= 1;
    }; 
  }
}
/**
 * 
 * 
 * const formData = new URLSearchParams();
                    formData.append('video_url', `https://cristatusbackapp-production.up.railway.app/image/${publicao[cont].nomeArquivos}`);
                    formData.append('caption', publicao[cont].legenda);
                    formData.append('access_token', chave[0].token);
                    formData.append('media_type', 'REELS'); // necessário para vídeo
                    formData.append('share_to_feed', 'true'); // ✅ necessário para REELS

                    const resp = await axios.post(
                    `https://graph.facebook.com/v23.0/${horaUser[0].idPerfil}/media`,
                    formData.toString(),
                    {
                        headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }
                    );

                    const respostaMetaConteiner = resp.data;
                    this.logger.debug(resp);

 * let status = '';
                    let tentativas = 0;

                    do {
                    tentativas++;
                    const statusResp = await fetch(
                        `https://graph.facebook.com/v23.0/${respostaMetaConteiner.id}?fields=status_code&access_token=${chave[0].token}`
                    );
                    const statusData = await statusResp.json();
                    status = statusData.status_code;

                    this.logger.debug(`Tentativa ${tentativas} - Status: ${status}`);

                    if (status !== 'FINISHED') {
                        await new Promise(resolve => setTimeout(resolve, 4000)); // espera 4 segundos
                    }
                    } while (status !== 'FINISHED' && tentativas < 20); // até 40s no máximo

                    if (status === 'FINISHED') {
                        await new Promise(resolve => setTimeout(resolve, 4000)); // espera 2 segundos
                        const publishResponse = await fetch(
                            `https://graph.facebook.com/v23.0/${horaUser[0].idPerfil}/media_publish?creation_id=${respostaMetaConteiner.id}&access_token=${chave[0].token}`,
                            { method: 'POST' }
                        );
                        const resultado = await publishResponse.json();
                        this.logger.debug('Resultado da publicação:', publishResponse);
                    } else {
                        this.logger.error('O vídeo não ficou pronto a tempo para publicação.');
                    }


                    /*if (respostaMetaConteiner.id) {
                        const publishResponse = await fetch(`https://graph.facebook.com/v23.0/${horaUser[0].idPerfil}/media_publish?creation_id=${respostaMetaConteiner.id}&access_token=${chave[0].token}`, {
                        method: 'POST'
                        });


                        const resultado = await publishResponse.json();
                        this.logger.debug('Resultado da publicação', resultado);

                        //const update = await connection('calendario')
                        //  .where('id', publicao[cont].id)
                            //.update('publicado', 'publicado');
                        //this.logger.debug(update);
                    }*/
