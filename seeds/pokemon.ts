/// <reference lib="es2019" />
import * as Knex from 'knex';
import data from './pokemons.json';

interface Attack {
  name: string;
  type: string;
  category: string;
  damage: number;
}

interface Evolution {
  to: number;
  requiredItem: string;
  requiredItemCount: number;
}

interface Pokemon {
  id: number;
  name: string;
  classification: string;
  types: string[];
  resistant: string[];
  weaknesses: string[];
  attacks: Attack[];
  minWeight: string;
  maxWeight: string;
  minHeight: string;
  maxHeight: string;
  fleeRate: number;
  maxCp: number;
  maxHp: number;
  evolution?: Evolution;
}

export async function seed(knex: Knex): Promise<void> {
  await knex.raw(
    `truncate table "pokemon", "pokemon_type", "attack_type", "attack_category" restart identity cascade`,
  );

  const pokemonTypes = new Set<string>();
  const attackTypes = new Set<string>();
  const attackCategories = new Set<string>();
  const pokemons: Pokemon[] = data.map((row) => {
    const id = Number(row.id);
    row.types.forEach((type) => pokemonTypes.add(type));
    [...row.weaknesses, ...row.resistant].forEach((type) =>
      attackTypes.add(type),
    );

    const attacks: Attack[] = [];
    Object.keys(row.attacks).forEach((category) => {
      attackCategories.add(category);
      const attacksInCategory = row.attacks[category as 'fast' | 'special'];
      attacksInCategory.forEach((attack) => {
        attackTypes.add(attack.type);
        attacks.push({
          name: attack.name,
          type: attack.type,
          category,
          damage: attack.damage,
        });
      });
    });

    return {
      id,
      name: row.name,
      classification: row.classification,
      types: row.types,
      resistant: row.resistant,
      weaknesses: row.weaknesses,
      attacks,
      minWeight: row.weight.minimum,
      maxWeight: row.weight.maximum,
      minHeight: row.height.minimum,
      maxHeight: row.height.maximum,
      fleeRate: row.fleeRate,
      maxCp: row.maxCP,
      maxHp: row.maxHP,
      evolution:
        row.evolutions == null || row.evolutionRequirements == null
          ? undefined
          : {
              to: row.evolutions[0].id,
              requiredItem: row.evolutionRequirements.name,
              requiredItemCount: row.evolutionRequirements.amount,
            },
    };
  });

  await knex('pokemon').insert(
    pokemons.map((dto) => ({
      id: dto.id,
      name: dto.name,
      classification: dto.classification,
      min_weight: dto.minWeight,
      max_weight: dto.maxWeight,
      min_height: dto.minHeight,
      max_height: dto.maxHeight,
      flee_rate: dto.fleeRate,
      max_cp: dto.maxCp,
      max_hp: dto.maxHp,
    })),
  );

  const pokemonTypesMap = await insertEnum(knex, 'pokemon_type', pokemonTypes);
  await knex('pokemon_is_type').insert(
    pokemons.flatMap(({ id, types }) =>
      types.map((type) => ({
        pokemon_id: id,
        type_id: pokemonTypesMap.get(type),
      })),
    ),
  );

  const attackTypesMap = await insertEnum(knex, 'attack_type', attackTypes);
  await knex('pokemon_is_resistant').insert(
    pokemons.flatMap(({ id, resistant }) =>
      resistant.map((type) => ({
        pokemon_id: id,
        attack_type_id: attackTypesMap.get(type),
      })),
    ),
  );
  await knex('pokemon_has_weakness').insert(
    pokemons.flatMap(({ id, weaknesses }) =>
      weaknesses.map((type) => ({
        pokemon_id: id,
        attack_type_id: attackTypesMap.get(type),
      })),
    ),
  );

  const attackCategoriesMap = await insertEnum(
    knex,
    'attack_category',
    attackCategories,
  );
  await knex('pokemon_attack').insert(
    pokemons.flatMap(({ id, attacks }) =>
      attacks.map((attack) => ({
        pokemon_id: id,
        name: attack.name,
        type_id: attackTypesMap.get(attack.type),
        category_id: attackCategoriesMap.get(attack.category),
        damage: attack.damage,
      })),
    ),
  );

  await knex('pokemon_evolution').insert(
    pokemons
      .map(({ id, evolution }) =>
        evolution == null
          ? null
          : {
              from_id: id,
              to_id: evolution.to,
              required_item: evolution.requiredItem,
              required_item_count: evolution.requiredItemCount,
            },
      )
      .filter(Boolean),
  );
}

async function insertEnum(knex: Knex, tableName: string, values: Set<string>) {
  const rows = await knex(tableName).insert(
    [...values].map((name) => ({ name })),
    '*',
  );
  return new Map<string, number>(rows.map((row) => [row.name, row.id]));
}
