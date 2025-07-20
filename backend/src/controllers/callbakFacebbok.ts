import { Controller, Get, Query, Res } from '@nestjs/common';
import axios from 'axios';
import connection from 'src/database/connection';

@Controller()
export class CallBackController {

  @Get('callback')
  async instagramCallback(@Query('code') code: string, @Query('state') cnpj: string, @Res() res: any) {
    try {
      // 1. Obter o token de acesso de curto prazo
      const { data } = await axios.get('https://graph.facebook.com/v23.0/oauth/access_token', {
        params: {
          client_id: '3117860508390563',
          client_secret: 'f6c1b6967c21415b7db5382bc90fe46d',
          redirect_uri: 'https://www.acasaprime1.com.br/callback',
          code,
        },
      });

      // 2. Obter o token de longo prazo
      const longLivedTokenResp = await axios.get('https://graph.facebook.com/v23.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: '3117860508390563',
          client_secret: 'f6c1b6967c21415b7db5382bc90fe46d',
          fb_exchange_token: data.access_token,
        },
      });

      const longToken = longLivedTokenResp.data.access_token;

      // 3. Obter informações do usuário do Facebook
      const userInfo = await axios.get('https://graph.facebook.com/v23.0/me', {
        params: { access_token: longToken, fields: 'id,name,email' },
      });

      const userName = userInfo.data.name;
      const userId = userInfo.data.id;
      const userEmail = userInfo.data.email;

      const empresaCNPJ = '38860300835'// cnpj;

      // 4. Buscar Instagram vinculado às páginas do usuário
      const pagesResponse = await axios.get('https://graph.facebook.com/v23.0/me/accounts', {
        params: { access_token: longToken },
      });

      let instagramId = null;
      let instagramProfilePic = null;

      for (const page of pagesResponse.data.data) {
        const pageId = page.id;

        // Buscar conta de Instagram vinculada à página
        const pageDetails = await axios.get(`https://graph.facebook.com/v23.0/${pageId}`, {
          params: {
            fields: 'connected_instagram_account',
            access_token: longToken,
          },
        });

        const connectedInsta = pageDetails.data.connected_instagram_account;

        if (connectedInsta && connectedInsta.id) {
          instagramId = connectedInsta.id;

          // Obter foto de perfil da conta do Instagram
          const instaProfile = await axios.get(`https://graph.facebook.com/v23.0/${instagramId}`, {
            params: {
              fields: 'username,profile_picture_url',
              access_token: longToken,
            },
          });

          instagramProfilePic = instaProfile.data.profile_picture_url;
          break;
        }
      }

      // 5. Montar dados para inserção no banco
      let Data = {
        user: userName,
        pass: 3333,
        token: longToken,
        idPerfil: userId,
        horario: 9,
        idInsta: instagramId,
        foto: instagramProfilePic,
        empresa: empresaCNPJ,
      };

      console.log('Dados para inserção:', Data);

      const verification = await connection('cliente').where('idperfil', userId);
      if (verification.length > 0) {
        // Usuário já cadastrado
        //cadastrar nova url de imagem no database;
        await connection('cliente').where('idperfil', userId).update('foto', instagramProfilePic);
        return res.redirect(`https://acasaprime1.com.br/dashboardCliente?token=${userId}`);
      } else {
        // Inserir novo usuário
        const T = await connection('cliente').insert(Data);
        console.log('Novo usuário cadastrado:', T);

        return res.redirect(`https://acasaprime1.com.br/dashboardCliente?token=${userId}`);
      }

    } catch (err) {
      console.error('Erro ao finalizar login com o Instagram:', err.response?.data || err.message);
      return res.status(500).send('Erro ao finalizar login com o Instagram.');
    }
  }
}
