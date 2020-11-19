import { PokemonType } from "./models/PokemonType";

export async function fetchAllTypes() {
  const types = await PokemonType.query().orderBy('name');
  return types.map(type => type.name);
}
