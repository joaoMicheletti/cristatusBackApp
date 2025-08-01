import { Body, Controller, Get, Post, Query, Res } from "@nestjs/common";
import { CalendarioEditorial } from '../../providers/calendario/calendariService';
import {CalendarioDTO} from './calendarioDTo' 
import connection from "src/database/connection";

@Controller() 

export class Calendario {
    constructor(private readonly CalendarioEditorial: CalendarioEditorial) {};
    @Get('/')
    home() {
        console.log('200 aqui ')
        return { status: 'ok' };
    }

    @Post('createCalendar')
    async createCalendario(@Body() data: CalendarioDTO): Promise<object> {
        return await this.CalendarioEditorial.createCalendario(data);
    };
    @Post('buscarData')
    async buscarData(@Body() data: CalendarioDTO): Promise<object>{
        return this.CalendarioEditorial.buscarData(data);
    };
    @Post('buscarCalendario')
    async buscarCalenadrio(@Body() data: CalendarioDTO): Promise<object> {
        return this.CalendarioEditorial.buscarCalendario(data);
    }
    //enviar para aprovação:
    @Post('enviarAprovacao')
    async aprovacao(@Body() data: CalendarioDTO):Promise<object> {
        console.log(data)
        return this.CalendarioEditorial.aprovacao(data);
    }
    // buscar para area de  update Midias
    @Post('buscarUpdateMidia')
    async buscarUpdateMidia(@Body() data:CalendarioDTO): Promise<object> {
        return await this.CalendarioEditorial.buscarUpdateMidia(data);
    }
    //buscar para area de aprovação:
    @Post('buscarAprovacao')
    async buscarAprovacao(@Body() data:CalendarioDTO): Promise<object> {
        return this.CalendarioEditorial.buscarAprovacao(data);
    } 
    // solicitar aprovação time:
    @Post('solicitarAprovacaoTime')
    async solicitarAprovacaoTime(@Body() data:CalendarioDTO): Promise<object> {
        return await this.CalendarioEditorial.solicitarAprovacaoTime(data);
    }
    // // aprovar o material para o clinete 
    @Post('aprovarParaCliente')
    async aprovarParaCliente(@Body() data:CalendarioDTO): Promise<object> {
        console.log('aqui esta acessando')
        return this.CalendarioEditorial.aprovarParaCliente(data)
    }
    // buscar material aprovado - Clinete.
    @Post('buscarClineteAprovado')
    async buscarAprovadoCliente(@Body() data: CalendarioDTO): Promise<object> {
        console.log('aquiesta acessando', data)
        return this.CalendarioEditorial.buscarAprovadoCliente(data);        
    }
    // solicitação de ajuste - pela gestão:
    @Post('ajusteGestao')
    async solicitarAjuste(@Body() data: CalendarioDTO) : Promise<object> {
        return this.CalendarioEditorial.solicitarAjuste(data);
    }
    // ajuste Cliente - solicitação .
    @Post('ajusteCliente')
    async ajusteCliente(@Body() data: CalendarioDTO): Promise<object> {
        return this.CalendarioEditorial.ajusteCliente(data);
    }
    // rota para salvar o nome do arquivo no banco de dados:
    @Post('nameFile')
    async nameFile(@Body() data: CalendarioDTO): Promise<object> {
        return await this.CalendarioEditorial.nameFile(data);
    }
    // funções da area de ajuste :
    // atualizar tema :
    @Post('updateTema')
    async updateTema(@Body() data: CalendarioDTO): Promise<object> {
        return await this.CalendarioEditorial.updateTema(data)
    };
    // atualizar foramto da publicação:
    @Post('updateFormato')
    async updateFormato(@Body() data: CalendarioDTO): Promise<object> {
        return await this.CalendarioEditorial.updateFormato(data);
    }
    // atulixando a legenda dapublicação
    @Post('updateLegenda')
    async updateLegenda(@Body() data: CalendarioDTO): Promise<object> {
        return await this.CalendarioEditorial.updateLegenda(data);
    };
    // legenda Unica: 
    @Post('legendaUnica')
    async Legenda(@Body() data: CalendarioDTO): Promise<object>{
        console.log('ta rolando aqui', data)
        return await this.CalendarioEditorial.Legenda(data)
    };
    // rota para aprovação da publicação - Clinte.
    @Post('aprovacaoCliente')
    async aprovacaoCliente(@Body() data: CalendarioDTO): Promise<object> {
        return await this.CalendarioEditorial.aprovacaoCliente(data);
    }
    // cadatrar token no bancao de dados :
    @Post('createToken')
    async createToken(@Body() data: CalendarioDTO): Promise<object>{
        return await this.CalendarioEditorial.createToken(data);
    };
    // buscar Arquivo Morto
    @Post('arquivoMorto')
    async arquivoMorto(@Body() data: CalendarioDTO): Promise<object> {
        console.log(data);
        let res = await connection('calendario').where('tokenUser', data.tokenUser).where('aprovadoCliente', 'aprovado').select("*")
        console.log(res)
        return{res}
        
    }
}