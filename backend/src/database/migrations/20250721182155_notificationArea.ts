
import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('notificationArea', function(table){
        table.increments();
        table.string('token');
        table.string('corpoNotification')
        table.string('status')
        
    });
}
export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('notificationArea');
}
