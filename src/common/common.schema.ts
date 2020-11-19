import { interfaceType } from "@nexus/schema";
import { toGlobalId } from "../utils/global-id";

export const Node = interfaceType({
  name: 'Node',
  description: 'An object with an ID',
  definition(t) {
    t.id('id', { 
      nullable: false, description: 'The ID of an object',
      resolve(root, args, ctx, info) {
        const typename = root.constructor.name ?? info.parentType.name;
        return toGlobalId(typename, root.$id());
      }
    });
    t.resolveType(() => null)
  }
});
