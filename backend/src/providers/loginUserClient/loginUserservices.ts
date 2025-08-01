import { Injectable } from '@nestjs/common';
import { LoginUserDTO } from 'src/controllers/loginUserClient/LoginUserDTO';
import connection from 'src/database/connection';

@Injectable()
export class LogunUserServices {
    async LoginUser(data: LoginUserDTO): Promise<object> {
        let res = ''; // variavel dedicada a armazenar a resposta da solicitação.
        console.log('LoginUser', data)
        // buscardo usuario 
        let user = await connection('cliente').where('idPerfil', data.user).select('*');
        console.log('aqqui',user)
        // verificação de usuário:
        if(user.length > 0){
            console.log('maio>', user.length)
            // se > 0 achamos o usuário, vamos verificar a senha:
            if(data.pass === user[0].pass){// se true logado com sucesso retotnar o token
                console.log('aio')
                console.log('seha iqual logado com sucesso');
                res = user[0].token
                // else: se não acharmos a senha retornar usuário ou senha incorreto.
            } else {
                res = "Usuário ou Senha incorreto!"
            };
        } else if(user.length === 0) { // retorno de usuário não encontrado
            console.log('length do user:', user)
            let User = await connection('cliente').where('user', data.user).select('*');
            console.log(User)
            
            if(data.pass === User[0].pass){// se true logado com sucesso retotnar o token
                console.log('senha');
                console.log('seha iqual logado com sucesso');
                res = User[0].token
                // else: se não acharmos a senha retornar usuário ou senha incorreto.
            } else {
                console.log('errado')
                res = "Usuário ou Senha incorreto!"
            };
            console.log('< 0')
        }
        return{res};
    }

    //funcionalidade para listar os clientes
    async listarClientes() {
        let response = await connection('cliente').select('*');
        return{response}
        
    }
}
