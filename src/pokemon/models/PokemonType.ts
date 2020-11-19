import BaseModel from "./BaseModel";

export class PokemonType extends BaseModel {
  static tableName = 'pokemonType';

  id!: number;
  name!: string;
}
