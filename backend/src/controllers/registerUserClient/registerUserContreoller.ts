import { Controller, Get, Body, Post } from '@nestjs/common';
import { RegisterUserServide } from '../../providers/registerUserClient/registerUserClient';
import { RegisterUserClietDTO } from './registerUserDTO'; // Renomeei para corresponder às convenções

@Controller() // Especificando o caminho base para o controller
export class RegisterUserController {
  constructor(private readonly registerUser: RegisterUserServide) {} // Melhorando o nome da variável para refletir o propósito

  @Post('registerUser')
  async Register(@Body() data: RegisterUserClietDTO): Promise<object> {
    return  this.registerUser.registerUser(data) // Usando a função do serviço para processar os dados
  };// buscar usuários - cliente - todos.
  @Get('getUser')
  async getUser(@Body() data:RegisterUserClietDTO): Promise<object>{
    return await this.registerUser.getUser(data);
  };
  // buscar um cliente especiufico:
  @Post('getOne')
  async getOneCliente(@Body() data: RegisterUserClietDTO): Promise<object>{
    return await this.registerUser.getOneCliente(data);
  }
  // registro de acessos no database:
  @Post('acessosCreate')
  async acessosCreate(@Body() data:RegisterUserClietDTO): Promise<object>{
    return await this.registerUser.acessosCreate(data);
  };
  // buscar acessos cadastrados:
  @Post('acessosGet')
  async buscarAcessos(@Body() data: RegisterUserClietDTO): Promise<object>{
    return await this.registerUser.buscarAcessos(data);
  };
  //
  // função para atualçizar o token de acesso:
  @Post('tokenInsta')
  async updateTokenAcess(@Body() data: RegisterUserClietDTO): Promise<object>{
    return await this.registerUser.updateTokenAcess(data);
  }
  // atualização de dados do cliet :
  // atualizando a senha do clienbte.
  @Post('updateSenhaUser')
  async updateSenhaUser(@Body() data: RegisterUserClietDTO): Promise<object>{
    return await this.registerUser.updateSenhaUser(data)
  };
  // update faturamento 
  @Post('updateFaturamento')
  async dataFaturamento(@Body() data: RegisterUserClietDTO): Promise<object>{
    return await this.registerUser.dataFaturamento(data);
  };
  //update hoprario de publicação:
  @Post('updateHora')
  async updateHora(@Body() data: RegisterUserClietDTO): Promise<object> {
    return await this.registerUser.updateHora(data);
  }
  //update Foto
  @Post('updateoFto')
  async updateFoto(@Body() data: RegisterUserClietDTO): Promise<object> {
    return await this.registerUser.updateFoto(data);
  };
  @Post('updateIdInsta')
  async updateIdInsta(@Body() data: RegisterUserClietDTO): Promise<object> {
    console.log(data);
    return await this.registerUser.updateIdPerfilInsta(data);
    
  }
}

