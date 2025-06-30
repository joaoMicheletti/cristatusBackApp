
import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('notifications', function(table){
        table.increments();
        table.string("idUser");
        table.string('endPoint');
        table.string('auth');
        table.string('p256dh');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('notifications');
}
