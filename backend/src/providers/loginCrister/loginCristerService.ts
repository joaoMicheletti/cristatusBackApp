import { Injectable } from "@nestjs/common";
import { LoginCristerDTO } from "src/controllers/loginCrister/loginCristerDTO";
import connection from "src/database/connection";

@Injectable()

export class LoginCristerService{
    async Login(data: LoginCristerDTO): Promise<object> {
        console.log('LoginCrister', data)
        let {user, pass} = data
        let condition = '';
        let response = await connection('crister').where('user', user).select('*');
        if(response.length > 0){
            console.log('aqui');
            if(response[0].pass === pass){
                console.log("TTTT");
                condition += response[0].cpf;
            } else {
                condition += 'User not found!';
            }
        }        
        return {res: condition};
    };
    async Register(data: LoginCristerDTO): Promise<object> {
        var user =  await connection('crister').where('user', data.user).select('*');
        if(user.length > 0){
            return {res: "Usuário já cadastrado."};
        }else {
            var response = await connection('crister').insert(data);
            // validar se o dado foi inserido no database 
            if(response[0] > 0){
                return {res: "Registrado com sucesso!"};
            }else {
                return {res: "Erro interno!"};
            }; 
        };        
    }
}