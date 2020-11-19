import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  
  await knex.schema.createTable('pokemon', table => {
    table.increments();
    table.text('name').notNullable().unique();
    table.text('classification');
    table.text('min_weight');
    table.text('max_weight');
    table.text('min_height');
    table.text('max_height');
    table.float('flee_rate');
    table.integer('max_cp');
    table.integer('max_hp');
  });

  await knex.schema.createTable('pokemon_evolution', table => {
    table.integer('from_id').notNullable().references('id').inTable('pokemon').onDelete('CASCADE');
    table.integer('to_id').notNullable().references('id').inTable('pokemon').onDelete('CASCADE');
    table.text('required_item').notNullable();
    table.integer('required_item_count').unsigned().notNullable();
    table.primary(['from_id', 'to_id']);
  });
  
  await knex.schema.createTable('pokemon_type', table => {
    table.increments();
    table.text('name').notNullable().unique();
  });

  await knex.schema.createTable('pokemon_is_type', table => {
    table.integer('pokemon_id').notNullable().references('id').inTable('pokemon').onDelete('CASCADE');
    table.integer('type_id').notNullable().references('id').inTable('pokemon_type').onDelete('CASCADE');
    table.primary(['pokemon_id', 'type_id']);
  });

  await knex.schema.createTable('attack_type', table => {
    table.increments();
    table.text('name').notNullable().unique();
  });

  await knex.schema.createTable('pokemon_is_resistant', table => {
    table.integer('pokemon_id').notNullable().references('id').inTable('pokemon').onDelete('CASCADE');
    table.integer('attack_type_id').notNullable().references('id').inTable('attack_type').onDelete('CASCADE');
    table.primary(['pokemon_id', 'attack_type_id']);
  });

  await knex.schema.createTable('pokemon_has_weakness', table => {
    table.integer('pokemon_id').notNullable().references('id').inTable('pokemon').onDelete('CASCADE');
    table.integer('attack_type_id').notNullable().references('id').inTable('attack_type').onDelete('CASCADE');
    table.primary(['pokemon_id', 'attack_type_id']);
  });

  await knex.schema.createTable('attack_category', table => {
    table.increments();
    table.text('name').notNullable().unique();
  });

  await knex.schema.createTable('pokemon_attack', table => {
    table.increments();
    table.integer('pokemon_id').notNullable().references('id').inTable('pokemon').onDelete('CASCADE');
    table.text('name').notNullable();
    table.integer('type_id').notNullable().references('id').inTable('attack_type');
    table.integer('category_id').notNullable().references('id').inTable('attack_category');
    table.integer('damage').unsigned().notNullable();
    table.unique(['pokemon_id', 'name']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('pokemon_has_weakness');
  await knex.schema.dropTable('pokemon_is_resistant');
  await knex.schema.dropTable('pokemon_attack');
  await knex.schema.dropTable('attack_type');
  await knex.schema.dropTable('attack_category');
  await knex.schema.dropTable('pokemon_is_type');
  await knex.schema.dropTable('pokemon_evolution');
  await knex.schema.dropTable('pokemon');
  await knex.schema.dropTable('pokemon_type');
}
