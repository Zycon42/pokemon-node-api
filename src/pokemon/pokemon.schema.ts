import { idArg, objectType, queryField } from '@nexus/schema';

export const Pokemon = objectType({
  name: 'Pokemon',
  description: 'Pokemon species',
  definition(t) {
    t.id('id', { nullable: false });
    t.string('name', {
      description: 'Unique pokemon species name',
      nullable: false,
    });
  },
});

export const pokemonQuery = queryField('pokemon', {
  type: 'Pokemon',
  args: { id: idArg({ required: true }) },
  resolve(root, { id }) {
    return null;
  },
});
