import { Controller, Get, Body, Post } from '@nestjs/common';
import { LogunUserServices } from '../../providers/loginUserClient/loginUserservices';
import { LoginUserDTO } from './LoginUserDTO'; // Renomeei para corresponder às convenções

@Controller() // Especificando o caminho base para o controller
export class LoginUserController {
  constructor(private readonly loginUserServices: LogunUserServices) {} // Melhorando o nome da variável para refletir o propósito

  @Post('loginUser')
  async loginUser(@Body() data: LoginUserDTO): Promise<object> {
    return  this.loginUserServices.LoginUser(data); // Usando a função do serviço para processar os dados
  };
  @Get('listarClientes')
  async listarClientes(@Body() data: LoginUserDTO): Promise<object> {
    return this.loginUserServices.listarClientes()
  }
}

