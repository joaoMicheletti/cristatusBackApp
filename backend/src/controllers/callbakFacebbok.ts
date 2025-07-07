import { Controller, Get, Query, Res } from '@nestjs/common';
import axios from 'axios';
import connection from 'src/database/connection';

@Controller()
export class CallBackController {

  @Get('callback')
  async instagramCallback(@Query('code') code: string, @Res() res: any) {
    try {
      const { data } = await axios.get(
        'https://graph.facebook.com/v23.0/oauth/access_token',
        {
          params: {
            client_id: '3117860508390563',
            client_secret: 'f6c1b6967c21415b7db5382bc90fe46d',
            redirect_uri: 'http://localhost:3333/callback',
            code,
          },
        },
      );

      const longLivedTokenResp = await axios.get(
        `https://graph.facebook.com/v23.0/oauth/access_token`,
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: '3117860508390563', // ✅ ISSO ESTAVA FALTANDO
            client_secret: 'f6c1b6967c21415b7db5382bc90fe46d',
            fb_exchange_token: data.access_token,
          },
        },
      );

      const longToken = longLivedTokenResp.data.access_token;

      const pages = await axios.get(
        `https://graph.facebook.com/v23.0/me/accounts`,
        { params: { access_token: longToken } },
      );

      const igData = await axios.get(
        `https://graph.facebook.com/v23.0/${pages.data.data[0].id}?fields=instagram_business_account`,
        { params: { access_token: longToken } },
      );
      

      const instagramId = igData.data.instagram_business_account.id;
      let Data = {
        user: instagramId,
        pass: instagramId,
        token: instagramId,
        idPerfil: instagramId,

      }
      let T = await connection('cliente').insert(Data);
      console.log('igDATA:', igData, T);

      return res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 2rem;">
            <h2>Login realizado com sucesso!</h2>
            <p>Você já pode fechar esta aba.</p>
            <a href="http://localhost:3000/dashboardCliente">DashBoard</a>
            <script>sessionStorage.setItem("token", ${instagramId});</script>
          </body>
        </html>
      `);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Erro ao finalizar login com o Instagram.');
    }
  }
}
