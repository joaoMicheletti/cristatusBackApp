
import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('crister', function(table){
        table.increments();
        table.string("cpf");// / cnpj
        table.string("nome");
        table.string("pass");
        table.string("plano");
        table.string("inicioPlano");
        table.string("terminoPlano");
        table.string('valorPlano');
        table.integer('colaboradores');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('crister');
}
