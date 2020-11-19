import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  // Add trgm extension that allows us to create GIN index for LIKE '%foo%' queries
  // standard index can be used only in LIKE 'foo%' scenario
  await knex.schema.raw(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
  await knex.schema.raw(`CREATE INDEX "pokemon_name_gin_index" ON "pokemon" USING GIN (name gin_trgm_ops)`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(`DROP INDEX "pokemon_name_gin_index"`);
  await knex.schema.raw(`DROP EXTENSION IF EXISTS pg_trgm`);
}
