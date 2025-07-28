
import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('wf', function(table){
        table.increments();
        table.string('token');
        table.string('funcao');
        table.string('empresa')
        
    });
}
export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('wf');
}
