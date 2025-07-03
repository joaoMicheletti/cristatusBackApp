import { Body, Controller, Post } from "@nestjs/common";
import { ColaboradorDto } from "./colaboradorDto";
import { colaboradorProvider } from "src/providers/colaborador/colaboradorService";

@Controller()

export class colaboradorController{
    constructor(private readonly colaborador: colaboradorProvider){}

    @Post('registerColab')
    async RegisterColaborador(@Body() data: ColaboradorDto): Promise<object> {
        return await this.colaborador.RegisterColaborador(data);
    }
    // roa para deletar colaborador. remover acesso a plataforma.
}