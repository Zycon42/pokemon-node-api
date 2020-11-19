import { raw } from 'objection';
import { Pokemon } from './models/Pokemon';

export async function toggleFavorite(pokemonId: string) {
  const pokemon = await Pokemon.query()
    .patch({ isFavorite: raw('NOT ??', ['isFavorite']) })
    .findById(pokemonId)
    .throwIfNotFound()
    .returning('*')
    .first();
  return { pokemon };
}
