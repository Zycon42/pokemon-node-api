import { AttackType } from './AttackType';
import BaseModel from './BaseModel';
import { PokemonAttack } from './PokemonAttack';
import { PokemonType } from './PokemonType';

export class Pokemon extends BaseModel {
  static tableName = 'pokemon';

  static relationMappings = {
    types: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: 'PokemonType',
      join: {
        from: 'pokemon.id',
        through: {
          from: 'pokemonIsType.pokemonId',
          to: 'pokemonIsType.typeId',
        },
        to: 'pokemonType.id',
      },
    },
    resistantTo: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: 'AttackType',
      join: {
        from: 'pokemon.id',
        through: {
          from: 'pokemonIsResistant.pokemonId',
          to: 'pokemonIsResistant.attackTypeId',
        },
        to: 'attackType.id',
      },
    },
    weaknesses: {
      relation: BaseModel.ManyToManyRelation,
      modelClass: 'AttackType',
      join: {
        from: 'pokemon.id',
        through: {
          from: 'pokemonHasWeakness.pokemonId',
          to: 'pokemonHasWeakness.attackTypeId',
        },
        to: 'attackType.id',
      },
    },
    attacks: {
      relation: BaseModel.HasManyRelation,
      modelClass: 'PokemonAttack',
      join: { from: 'pokemon.id', to: 'pokemonAttack.pokemonId' },
    },
  };

  id!: number;
  name!: string;
  classification!: string | null;
  minHeight!: string | null;
  maxHeight!: string | null;
  minWeight!: string | null;
  maxWeight!: string | null;
  fleeRate!: number | null;
  maxCp!: number | null;
  maxHp!: number | null;
  isFavorite!: boolean;

  get height() {
    return {
      minimum: this.minHeight,
      maximum: this.maxHeight,
    };
  }

  get weight() {
    return {
      minimum: this.minWeight,
      maximum: this.maxWeight,
    };
  }

  types!: PokemonType[];
  resistantTo!: AttackType[];
  weaknesses!: AttackType[];
  attacks!: PokemonAttack[];
}
