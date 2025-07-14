import { Body, Injectable } from '@nestjs/common';
import { RegisterUserClietDTO } from 'src/controllers/registerUserClient/registerUserDTO';
import connection from 'src/database/connection';

@Injectable()
export class RegisterUserServide {
    //registrando usuario-cliente
    async registerUser(data: RegisterUserClietDTO): Promise<object> {
        console.log(data.user);
        var verificar = await connection("cliente").where('user', data.user).where('pass', data.pass).select("*");
        
        if(verificar.length > 0){
            console.log(verificar);
            return {res: "Usuário Já cadastrado"};
        }
        else {
            const {user, pass, initPlano, idPerfil} = data;  // desconstruindo o data para crar um novo ogjeto 
            var token =  initPlano+user // token de acesso 
            //objeto comas infomações a serem escritas no database.
            var Data = {
                user,
                pass,
                initPlano, 
                token,
                idPerfil
            }
            var response = await connection('cliente').insert(Data);
            // validar se o dado foi inserido no database 
            if(response[0] > 0){
                return {res: "Registrado com sucesso!"};
            }else {
                return {res: "Erro interno!"};
            };              

        }
        
    };
    async getUser(data: RegisterUserClietDTO): Promise<object> {
        let res = await connection("cliente").select("*");
        return{res};
    };
    // buscando um cliente especifico:
    async getOneCliente(data: RegisterUserClietDTO): Promise<object>{
        let res = await connection('cliente').where('token', data.token);
        return{res}
    }
    // registro de acesso no banco de dados:
    async acessosCreate(data: RegisterUserClietDTO): Promise<object> {
        let res = ''
        let ress =  await connection('acessos').insert(data);
        if(ress.length > 0){
            res = "Acesso cadastrado com sucesso!"
        }
        return {res}
    };
    // function para buscar os acessos cadastrados.
    async buscarAcessos(data: RegisterUserClietDTO): Promise<object>{
        var res = await connection('acessos').where('token', data.token).select('*');
        return{res}
    };
    // função para atualixzar o tokende acesso para automação das publicações:
    async updateTokenAcess(data:RegisterUserClietDTO): Promise<object> {
        let res = '';
        let buscar = await connection('automacao').select('*'); //primeira verificação
        if(buscar.length === 0){
            res = await connection('automacao').insert(data);
        } else{ // atualização, efetuar se já estiver com um token cadastrado;
            console.log(buscar);
            let resp = await connection('automacao').where('id', 1).update('token', data);
            console.log(resp);
            res += resp;
        }
        return{res} // atualizado com sucesso 
    };
    //atualizando dados do usuario:
    async updateSenhaUser(data: RegisterUserClietDTO): Promise<object> {
        let res = await connection('cliente').where('token', data.token)
        .update('pass', data.pass);
        console.log('!!!!!', res)
        console.log('updateSenha', data);
        if(res.length > 1){
            return{res: 'senha atualizada com sucesso!'}
        } else {
            return{res: 'erro ao editar senha!'}
        }
        
    };
    // update data de faturamento:
    async dataFaturamento(data: RegisterUserClietDTO): Promise<object>{
        console.log('faturamento update', data);
        let res = await connection('cliente').where('token', data.token)
        .update('diaVencimento', data.diaVencimento);
        if(res.length > 1){
            return{res: 'data atualizada com sucesso!'}
        } else {
            return{res: 'erro ao editar Data de faturametno!'}
        }
    };
    // update hora de publicar o material:
    async updateHora(data: RegisterUserClietDTO): Promise<object> {
        let res = await connection('cliente').where('token', data.token)
        .update('horario', data.horario);
        console.log('hora', res)
        return {res}
    };
    //update Foto {}
    async updateFoto(data: RegisterUserClietDTO): Promise<object> {
        console.log('data', data)
        let sep = data.foto.split('.');
        console.log(sep)
        let T = await connection('cliente').where('id', data.id).update('foto', data.foto)
        console.log("TESTANDO:", T)
        return{res: T}
    };
    // atualizar id de perfil.
    async  updateIdPerfilInsta(data: RegisterUserClietDTO): Promise<object> {
        console.log(data)
        let res = await connection('cliente').where('token', data.token).update('idInsta', data.idInsta);
        console.log(res)
        return{res}
        
    }
};
