import { Body, Controller, Post } from "@nestjs/common";
import { LoginCristerDTO } from "./loginCristerDTO";
import {LoginCristerService} from '../../providers/loginCrister/loginCristerService';

@Controller()

export class LoginCristerController{
    constructor(private readonly LoginCristerService: LoginCristerService){}

    @Post('loginCrister')
    async LoginCrister(@Body() data: LoginCristerDTO): Promise<object> {
        return await this.LoginCristerService.Login(data);
    }

    @Post('registerCrister')
    async Register(@Body() data: LoginCristerDTO): Promise<object> {
        return await this.LoginCristerService.Register(data);
    }
}