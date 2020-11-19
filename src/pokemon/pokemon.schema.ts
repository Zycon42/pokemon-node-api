import path from 'path';
import { idArg, objectType, queryField, stringArg } from '@nexus/schema';
import { fetchPokemonRelation, findForConnection, findPokemonById, findPokemonByName } from './pokemon.repository';
import { fetchAttackRelation } from './pokemon-attack.repository';
import { fetchAllTypes } from './pokemon-type.repository';
import batchResolver from '../utils/batch-resolver';
import { fromGlobalId } from '../utils/global-id';

export const PokemonAttack = objectType({
  name: 'PokemonAttack',
  description: 'The attack pokemon can perform',
  rootTyping: {
    path: path.join(__dirname, './models/PokemonAttack.ts'),
    name: 'PokemonAttack',
  },
  definition(t) {
    t.implements('Node');
    t.field('pokemon', {
      type: 'Pokemon',
      nullable: false,
      resolve: batchResolver(async (sources) => {
        return await fetchAttackRelation(
          sources.map(({ source }) => source),
          'pokemon',
        );
      }),
    });
    t.string('name', {
      nullable: false,
      description: 'Name of a attack. Is unique among this species attacks.',
    });
    t.string('category', {
      nullable: false,
      description: 'Attack category',
      resolve: batchResolver(async (sources) => {
        const categories = await fetchAttackRelation(
          sources.map(({ source }) => source),
          'category',
        );
        return categories.map((category) => category.name);
      }),
    });
    t.string('type', {
      nullable: false,
      description: 'Attack type',
      resolve: batchResolver(async (sources) => {
        const types = await fetchAttackRelation(
          sources.map(({ source }) => source),
          'type',
        );
        return types.map((type) => type.name);
      }),
    });
    t.int('damage', {
      description: 'Damage on HP this attack does',
      nullable: false,
    });
  },
});

export const Pokemon = objectType({
  name: 'Pokemon',
  description: 'Pokemon species',
  rootTyping: {
    path: path.join(__dirname, './models/Pokemon.ts'),
    name: 'Pokemon',
  },
  definition(t) {
    t.implements('Node');
    t.string('code', {
      nullable: false,
      description: 'The unique ID amongs pokemon species',
      resolve(root) {
        return root.id.toString();
      }
    });
    t.string('name', {
      description: 'Unique pokemon species name',
      nullable: false,
    });
    t.string('classification', { description: 'Pokemon classification' });
    t.field('height', {
      type: 'PhysicalQuantity',
      description: 'The height of adult members of species',
    });
    t.field('weight', {
      type: 'PhysicalQuantity',
      description: 'The weight of adult members of species',
    });
    t.float('fleeRate');
    t.int('maxCp');
    t.int('maxHp');
    t.string('types', {
      list: [true],
      description: 'The types of this pokemon species',
      resolve: batchResolver(async (sources) => {
        const types = await fetchPokemonRelation(
          sources.map(({ source }) => source),
          'types',
        );
        return types.map((types) => types.map((type) => type.name));
      }),
    });
    t.string('resistantTo', {
      list: [true],
      description: 'This pokemon is resistant to these attack types',
      resolve: batchResolver(async (sources) => {
        const types = await fetchPokemonRelation(
          sources.map(({ source }) => source),
          'resistantTo',
        );
        return types.map((types) => types.map((type) => type.name));
      }),
    });
    t.string('weaknesses', {
      list: [true],
      description: 'This pokemon has weakness to these attack types',
      resolve: batchResolver(async (sources) => {
        const types = await fetchPokemonRelation(
          sources.map(({ source }) => source),
          'weaknesses',
        );
        return types.map((types) => types.map((type) => type.name));
      }),
    });
    t.field('attacks', {
      list: [true],
      type: 'PokemonAttack',
      description: 'The attacks this species can make',
      resolve: batchResolver(async (sources) => {
        const attacks = await fetchPokemonRelation(
          sources.map(({ source }) => source),
          'attacks',
        );
        return attacks.map((attacks, index) => {
          const pokemon = sources[index].source;
          return attacks.map((attack) => {
            attack.$setRelated('pokemon', pokemon);
            return attack;
          });
        });
      }),
    });
  },
});

export const PhysicalQuantity = objectType({
  name: 'PhysicalQuantity',
  definition(t) {
    t.string('minimum');
    t.string('maximum');
  },
});

export const pokemonQuery = queryField('pokemon', {
  type: 'Pokemon',
  args: { 
    id: idArg(),
    code: stringArg(),
    name: stringArg(),
  },
  async resolve(root, { id, code, name }) {
    const argsCount = Number(id != null) + Number(code != null) + Number(name != null);
    if (argsCount !== 1) {
      throw new Error('Exactly one of id, code, name arguments must be provided');
    }
    if (id != null) {
      const globalId = fromGlobalId(id);
      if (globalId.type !== 'Pokemon') {
        return null;
      }
      return await findPokemonById(globalId.id);
    }
    if (code != null) {
      return await findPokemonById(code);
    }
    if (name != null) {
      return await findPokemonByName(name);
    }
    return null;
  },
});

export const pokemonsQuery = queryField(t => t.connectionField('pokemons', {
  type: 'Pokemon',
  additionalArgs: {
    name: stringArg({ description: 'Search by pokemon name' }),
    type: stringArg({ description: 'Filter by pokemon type' })
  },
  extendConnection(t) {
    t.int('totalCount', {
      description: 'Identifies the total count of items in the connection.',
    });
  },
  resolve(root, args) {
    return findForConnection(args);
  }
}));

export const pokemonTypesQuery = queryField('pokemonTypes', {
  type: 'String',
  list: true,
  nullable: false,
  resolve() {
    return fetchAllTypes();
  }
});
