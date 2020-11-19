import { ModelRelations } from 'objection';
import { Pokemon } from "./models/Pokemon";

export async function findPokemonById(id: string | number) {
  return await Pokemon.query().findById(id);
}

export async function findPokemonByName(name: string) {
  return await Pokemon.query().findOne({ name });
}

export async function fetchPokemonRelation<K extends ModelRelations<Pokemon>>(models: Pokemon[], relation: K) {
  const loaded = await Pokemon.fetchGraph(models, relation, { skipFetched: true });
  return loaded.map(model => model[relation]);
}
