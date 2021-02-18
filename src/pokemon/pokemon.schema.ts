import path from 'path';
import {
  arg,
  booleanArg,
  idArg,
  inputObjectType,
  list,
  mutationField,
  nonNull,
  objectType,
  queryField,
  stringArg,
} from 'nexus';
import {
  fetchPokemonRelation,
  findForConnection,
  findPokemonById,
  findPokemonByName,
} from './pokemon.repository';
import { fetchAttackRelation } from './pokemon-attack.repository';
import { fetchAllTypes } from './pokemon-type.repository';
import batchResolver from '../utils/batch-resolver';
import { fromGlobalId } from '../utils/global-id';
import { toggleFavorite } from './pokemon.commands';

export const PokemonAttack = objectType({
  name: 'PokemonAttack',
  description: 'The attack pokemon can perform',
  sourceType: {
    module: path.join(__dirname, './models/PokemonAttack.ts'),
    export: 'PokemonAttack',
  },
  definition(t) {
    t.implements('Node');
    t.nonNull.field('pokemon', {
      type: 'Pokemon',
      resolve: batchResolver(async (sources) => {
        return await fetchAttackRelation(
          sources.map(({ source }) => source),
          'pokemon',
        );
      }),
    });
    t.nonNull.string('name', {
      description: 'Name of a attack. Is unique among this species attacks.',
    });
    t.nonNull.string('category', {
      description: 'Attack category',
      resolve: batchResolver(async (sources) => {
        const categories = await fetchAttackRelation(
          sources.map(({ source }) => source),
          'category',
        );
        return categories.map((category) => category.name);
      }),
    });
    t.nonNull.string('type', {
      description: 'Attack type',
      resolve: batchResolver(async (sources) => {
        const types = await fetchAttackRelation(
          sources.map(({ source }) => source),
          'type',
        );
        return types.map((type) => type.name);
      }),
    });
    t.nonNull.int('damage', {
      description: 'Damage on HP this attack does',
    });
  },
});

export const Pokemon = objectType({
  name: 'Pokemon',
  description: 'Pokemon species',
  sourceType: {
    module: path.join(__dirname, './models/Pokemon.ts'),
    export: 'Pokemon',
  },
  definition(t) {
    t.implements('Node');
    t.nonNull.string('code', {
      description: 'The unique ID amongs pokemon species',
      resolve(root) {
        return root.id.toString();
      },
    });
    t.nonNull.string('name', {
      description: 'Unique pokemon species name',
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
    t.nonNull.boolean('isFavorite');
    t.field('types', {
      type: list(nonNull('String')),
      description: 'The types of this pokemon species',
      resolve: batchResolver(async (sources) => {
        const types = await fetchPokemonRelation(
          sources.map(({ source }) => source),
          'types',
        );
        return types.map((types) => types.map((type) => type.name));
      }),
    });
    t.field('resistantTo', {
      type: list(nonNull('String')),
      description: 'This pokemon is resistant to these attack types',
      resolve: batchResolver(async (sources) => {
        const types = await fetchPokemonRelation(
          sources.map(({ source }) => source),
          'resistantTo',
        );
        return types.map((types) => types.map((type) => type.name));
      }),
    });
    t.field('weaknesses', {
      type: list(nonNull('String')),
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
      type: list(nonNull('PokemonAttack')),
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
    const argsCount =
      Number(id != null) + Number(code != null) + Number(name != null);
    if (argsCount !== 1) {
      throw new Error(
        'Exactly one of id, code, name arguments must be provided',
      );
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

export const pokemonsQuery = queryField((t) =>
  t.connectionField('pokemons', {
    type: 'Pokemon',
    additionalArgs: {
      name: stringArg({ description: 'Search by pokemon name' }),
      type: stringArg({ description: 'Filter by pokemon type' }),
      isFavorite: booleanArg({ description: 'Filters by favorite' }),
    },
    extendConnection(t) {
      t.int('totalCount', {
        description: 'Identifies the total count of items in the connection.',
      });
    },
    resolve(root, args) {
      return findForConnection(args);
    },
  }),
);

export const pokemonTypesQuery = queryField('pokemonTypes', {
  type: nonNull(list(nonNull('String'))),
  resolve() {
    return fetchAllTypes();
  },
});

export const ToggleFavoriteInput = inputObjectType({
  name: 'ToggleFavoriteInput',
  definition(t) {
    t.nonNull.id('pokemonId');
  },
});

export const ToggleFavoritePayload = objectType({
  name: 'ToggleFavoritePayload',
  definition(t) {
    t.nonNull.field('pokemon', {
      type: 'Pokemon',
      description: 'Updated pokemon',
    });
  },
});

export const toggleFavoriteMutation = mutationField('toggleFavorite', {
  type: 'ToggleFavoritePayload',
  args: {
    input: nonNull(arg({ type: 'ToggleFavoriteInput' })),
  },
  resolve(root, { input: { pokemonId } }) {
    const { id, type } = fromGlobalId(pokemonId);
    if (type !== 'Pokemon') {
      throw new Error('Invalid cursor');
    }
    return toggleFavorite(id);
  },
});
