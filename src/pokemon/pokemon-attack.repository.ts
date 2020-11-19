import { ModelRelations } from "objection";
import { PokemonAttack } from "./models/PokemonAttack";

export async function fetchAttackRelation<K extends ModelRelations<PokemonAttack>>(models: PokemonAttack[], relation: K) {
  const loaded = await PokemonAttack.fetchGraph(models, relation, { skipFetched: true });
  return loaded.map(model => model[relation]);
}
