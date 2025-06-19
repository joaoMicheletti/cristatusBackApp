
import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('crister', function(table){
        table.increments();
        table.string("nome");
        table.string('cargo');
        table.string("cpf");
        table.string("user");
        table.string("pass");
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('crister');
}
