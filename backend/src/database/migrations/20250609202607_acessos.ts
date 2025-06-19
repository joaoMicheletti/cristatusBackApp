
import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('acessos', function(table){
        table.increments();
        table.string("plataforma");
        table.string('email');
        table.string("senha");
        table.string("token");
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('acessos');
}
