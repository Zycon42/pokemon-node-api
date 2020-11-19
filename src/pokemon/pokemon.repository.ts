import { ModelRelations } from 'objection';
import {
  connectionFromArraySlice,
  getOffsetWithDefault,
} from '../utils/connection';
import { Pokemon } from './models/Pokemon';

export async function findPokemonById(id: string | number) {
  return await Pokemon.query().findById(id);
}

export async function findPokemonByName(name: string) {
  return await Pokemon.query().findOne({ name });
}

export async function fetchPokemonRelation<K extends ModelRelations<Pokemon>>(
  models: Pokemon[],
  relation: K,
) {
  const loaded = await Pokemon.fetchGraph(models, relation, {
    skipFetched: true,
  });
  return loaded.map((model) => model[relation]);
}

interface ConnectionArgs {
  first: number;
  after?: string | null;
  name?: string | null;
  type?: string | null;
}

export async function findForConnection(args: ConnectionArgs) {
  const query = Pokemon.query();

  if (args.type != null) {
    query.joinRelated('types').where('types.name', args.type);
  }

  if (args.name != null) {
    const value = args.name;
    const escaped = value.replace(/[_%\\]/g, '\\$&');
    const pattern = `%${escaped}%`;
    query.where('name', 'ilike', pattern);
  }

  query.orderBy('id');

  const offset = getOffsetWithDefault(args.after, -1) + 1;
  const result = await query.range(offset, offset + args.first - 1);
  const connection = connectionFromArraySlice(result.results, args, {
    sliceStart: offset,
    arrayLength: result.total,
  });
  return {
    ...connection,
    totalCount: result.total,
    get nodes() {
      return connection.edges.map(({ node }) => node);
    },
  };
}
