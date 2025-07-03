
import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('automacao', function(table){
        table.increments();
        table.string("token");
        table.string('datalimite');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('automacao');
}
