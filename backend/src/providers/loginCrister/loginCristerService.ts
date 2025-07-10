import { Injectable } from "@nestjs/common";
import { LoginCristerDTO } from "src/controllers/loginCrister/loginCristerDTO";
import connection from "src/database/connection";

@Injectable()

export class LoginCristerService{
    async Login(data: LoginCristerDTO): Promise<object> {
        console.log('LoginCrister', data)
        let {user, pass} = data
        let condition = 'User not found!';
        let response = await connection('crister').where('cpf', user).select('*');

        console.log('response:',response)
        if(response.length > 0){
            console.log('aqui');
            if(response[0].pass === pass){
                console.log("TTTT");
                condition = user;
            } else {
                condition += 'User not found!';
            }
        }       
        return {res: condition};
    };
    async Register(data: LoginCristerDTO): Promise<object> {
        console.log(data)
        var user =  await connection('crister').where('cpf', data.cpf).select('*');
        if(user.length > 0){
            return {res: "Usuário já cadastrado."};
        } else {
            console.log('nada qui')
            var response = await connection('crister').insert(data);
            // validar se o dado foi inserido no database 
            if(response[0] > 0){
                return {res: "Registrado com sucesso!"};
            }else {
                return {res: "Erro interno!"};
            }; 
        }
        return {} 
    }
}