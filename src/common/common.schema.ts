import { interfaceType } from 'nexus';
import { toGlobalId } from '../utils/global-id';

export const Node = interfaceType({
  name: 'Node',
  description: 'An object with an ID',
  definition(t) {
    t.nonNull.id('id', {
      description: 'The ID of an object',
      resolve(root, args, ctx, info) {
        const typename = root.constructor.name ?? info.parentType.name;
        return toGlobalId(typename, root.$id());
      },
    });
  },
  resolveType: () => null,
});
