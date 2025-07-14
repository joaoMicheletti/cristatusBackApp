import { Controller, Get, Query, Res } from '@nestjs/common';
import axios from 'axios';
import connection from 'src/database/connection';

@Controller()
export class CallBackController {

  @Get('callback')
  async instagramCallback(@Query('code') code: string, @Query('state') cnpj: string, @Res() res: any) {
    try {
      // 1. Obter o token de acesso de curto prazo
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

      // 2. Obter o token de longo prazo
      const longLivedTokenResp = await axios.get(
        `https://graph.facebook.com/v23.0/oauth/access_token`,
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: '3117860508390563',
            client_secret: 'f6c1b6967c21415b7db5382bc90fe46d',
            fb_exchange_token: data.access_token,
          },
        },
      );

      const longToken = longLivedTokenResp.data.access_token;

      // 3. Obter informações do usuário (nome, ID, e-mail, etc.)
      const userInfo = await axios.get(
        `https://graph.facebook.com/v23.0/me`,
        { params: { access_token: longToken, fields: 'id,name,email' } },
      );

      const userName = userInfo.data.name; // Nome do usuário
      const userId = userInfo.data.id; // ID do usuário no Facebook
      const userEmail = userInfo.data.email; // E-mail (se disponível)

      // 4. Associar o CNPJ da empresa recebido via parâmetro 'state'
      const empresaCNPJ = cnpj; // O CNPJ foi passado na URL via 'state'

      // 5. Verificar se o usuário já está cadastrado
      let Data = {
        user: userName, // Armazena o nome do usuário
        pass: 3333,   // Usamos o ID do Facebook como senha (ou pode ser outro campo)
        token: longToken,
        idPerfil: userId,
        horario: 9,
        empresa: empresaCNPJ, // Associamos o CNPJ da empresa
      };
      console.log(Data)

      let verification = await connection('cliente').where('idperfil', userId);
      if (verification.length > 0) {
        // Caso o usuário já esteja cadastrado
        return res.send(`
          <html>
            
            <body style="font-family: sans-serif; text-align: center; padding: 2rem;">
              <script>sessionStorage.setItem("token", ${userId});</script>
              <h2>Usuário Já cadastrado!</h2>
              <p>Você já pode fechar esta aba.</p>
              <a href="http://localhost:3000/dashboardCliente">Acessar seu DashBoard</a>  
            </body>
          </html>
        `);
      } else {
        // Caso o usuário não esteja cadastrado
        let T = await connection('cliente').insert(Data);
        console.log('Novo usuário cadastrado:', T);

        return res.send(`
          <html>
            <body style="font-family: sans-serif; text-align: center; padding: 2rem;">
              <h2>Login realizado com sucesso!</h2>
              <p>Você já pode fechar esta aba.</p>
              <a href="http://localhost:3000/dashboardCliente">DashBoard</a>
              <script>sessionStorage.setItem("token", ${userId});</script>
            </body>
          </html>
        `);
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send('Erro ao finalizar login com o Instagram.');
    }
  }
}
