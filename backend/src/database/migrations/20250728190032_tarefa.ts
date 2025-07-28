
import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('tarefa', function(table){
        table.increments();
        table.string('token');
        table.string('diaSemana');
        table.string('dia');
        table.string('mes');
        table.string('ano');
        table.string('prazo');
        table.string('tag');
        table.string('descricao');
        table.string('materialApoio');        
    });
}
export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('tarefa');
}
