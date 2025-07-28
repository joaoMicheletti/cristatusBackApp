import {Injectable } from "@nestjs/common";
import connection from "src/database/connection";
import { ColaboradorDto } from "src/controllers/colaborador/colaboradorDto";
@Injectable()

export class colaboradorProvider { 
    // registro de colaborador
    async RegisterColaborador(data: ColaboradorDto): Promise<any> {
        console.log('ola', data )
        let Data = {
            user:data.user,
            pass:data.pass,
            funcao:data.funcao,
            empresa:data.empresa,
            token: `${data.empresa}${data.user}${data.funcao}`
        }
        //definir um token - empresa-nome-funcao
        // verificando cadastro exstente:
        let verification = await connection('colaborador')
        .where('user', data.user)
        .where('pass', data.pass)
        .where('funcao', data.funcao)
        .where('empresa', data.empresa)
        
        
        console.log('data', verification.length);
        if(verification.length>0){
            return {res:"Colaborador já cadasstrado!"};
        }else {
            let res = await connection('colaborador').insert(Data);
            if(res.length > 0){
                // cfiar o Wf do colaborador:
                let dataWf = {
                    token: Data.token,
                    funcao: Data.funcao,
                    empresa: Data.empresa
                }
                let wf = await connection('wf').insert(dataWf);
                console.log('CRiado o Wf do colaborador.', wf)
                return{res: "Registrado com sucesso!"}
            } else {
                return {res: "Erro ao efetuar o registro"}
            }
        }
    
    }

}