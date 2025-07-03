
import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('calendario', function(table){
        table.increments();
        table.string("dia");
        table.string("mes");
        table.string("ano");
        table.string("tokenUser");
        table.string('tema');
        table.string('formato');
        table.string("art");
        table.text('nomeArquivos');
        table.string("legenda");
        table.string("storyRoteiro");
        table.string("story");
        table.string('ajusteCrister');
        table.string("ajusteCliente");
        table.string("aprovadoCrister");
        table.string("aprovadoCliente");
        table.string('idperfil');
        table.string('descricaoArte');
        table.string('publicado');
        table.string('hora');
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('calendario');
}
