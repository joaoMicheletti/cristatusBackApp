
import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('cliente', function(table){
        table.increments();
        table.string("user");
        table.string("pass");
        table.string("initPlano");
        table.string("diaVencimento");
        table.string("token");
        table.string('idPerfil');
        table.string('horario');
        table.string('empresa');
        table.string('foto');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('cliente');
}
