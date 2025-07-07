import { Controller, Get, Query, Res } from '@nestjs/common';
import axios from 'axios';

@Controller()
export class CallBackController {

  @Get('callback')
  async instagramCallback(@Query('code') code: string, @Res() res: any) {
    try {
      const { data } = await axios.get(
        'https://graph.facebook.com/v23.0/oauth/access_token',
        {
          params: {
            client_id: process.env.FB_APP_ID,
            client_secret: process.env.FB_APP_SECRET,
            redirect_uri: 'http://localhost:3000/auth/callback',
            code,
          },
        },
      );

      const longLivedTokenResp = await axios.get(
        `https://graph.facebook.com/v23.0/oauth/access_token`,
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: process.env.FB_APP_ID,
            client_secret: process.env.FB_APP_SECRET,
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
      console.log('igDATA:', igData);

      const instagramId = igData.data.instagram_business_account.id;

      return res.send(`
        <html>
          <body style="font-family: sans-serif; text-align: center; padding: 2rem;">
            <h2>Login realizado com sucesso!</h2>
            <p>Você já pode fechar esta aba.</p>
            <script>setTimeout(() => window.close(), 3000)</script>
          </body>
        </html>
      `);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Erro ao finalizar login com o Instagram.');
    }
  }
}
