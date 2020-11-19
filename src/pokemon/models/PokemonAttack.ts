import { AttackCategory } from "./AttackCategory";
import { AttackType } from "./AttackType";
import BaseModel from "./BaseModel";
import { Pokemon } from "./Pokemon";

export class PokemonAttack extends BaseModel {
  static tableName = 'pokemonAttack';

  static relationMappings = {
    pokemon: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'Pokemon',
      join: {
        from: 'pokemonAttack.pokemonId',
        to: 'pokemon.id'
      }
    },
    type: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'AttackType',
      join: {
        from: 'pokemonAttack.typeId',
        to: 'attackType.id',
      }
    },
    category: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'AttackCategory',
      join: {
        from: 'pokemonAttack.categoryId',
        to: 'attackCategory.id',
      }
    }
  };

  id!: number;
  pokemonId!: number;
  pokemon!: Pokemon;
  name!: string;
  typeId!: number;
  type!: AttackType;
  categoryId!: number;
  category!: AttackCategory;
  damage!: number;
}
