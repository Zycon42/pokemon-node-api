import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('pokemon', table => {
    table.boolean('is_favorite').notNullable().defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('pokemon', table => {
    table.dropColumn('is_favorite');
  });
}
