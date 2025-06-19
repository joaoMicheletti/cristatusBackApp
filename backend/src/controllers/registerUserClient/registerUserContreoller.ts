import { Controller, Get, Body, Post } from '@nestjs/common';
import { RegisterUserServide } from '../../providers/registerUserClient/registerUserClient';
import { RegisterUserClietDTO } from './registerUserDTO'; // Renomeei para corresponder às convenções

@Controller() // Especificando o caminho base para o controller
export class RegisterUserController {
  constructor(private readonly registerUser: RegisterUserServide) {} // Melhorando o nome da variável para refletir o propósito

  @Post('registerUser')
  async Register(@Body() data: RegisterUserClietDTO): Promise<object> {
    return  this.registerUser.registerUser(data) // Usando a função do serviço para processar os dados
  };
  @Get('getUser')
  async getUser(@Body() data:RegisterUserClietDTO): Promise<object>{
    return await this.registerUser.getUser(data);
  };
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
}

