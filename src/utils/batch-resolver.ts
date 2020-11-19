/* eslint-disable @typescript-eslint/no-explicit-any */
import { GraphQLResolveInfo } from 'graphql';
import Dataloader from 'dataloader';
import { getContext } from '../context';

type FieldResolver<Source, Args, Ctx, Return> = (
  source: Source,
  args: Args,
  context: Ctx,
  info: GraphQLResolveInfo,
) => Promise<Return>;

type Query<Source, Args> = { source: Source; args: Args };

type BatchFieldResolver<Source, Args, Ctx, Return> = (
  queries: readonly Query<Source, Args>[],
  context: Ctx,
  info: GraphQLResolveInfo,
) => Promise<(Return | Error)[]>;

export default function batchResolver<
  Source,
  Args = Record<string, any>,
  Ctx = any,
  Return = any
>(
  batchResolverFn: BatchFieldResolver<Source, Args, Ctx, Return>,
): FieldResolver<Source, Args, Ctx, Return> {
  return (source, args, ctx, info) => {
    const registry = getDataloaderRegistry();
    const id = `${info.parentType.toString()}.${info.fieldName}`;
    const loader = registry.get<Query<Source, Args>, Return>(id, (keys) => {
      return batchResolverFn(keys, ctx, info);
    });
    return loader.load({ source, args });
  };
}

const kDataloaderRegistry = Symbol('DataloaderRegistry');

declare module '../context' {
  interface Context {
    [kDataloaderRegistry]?: DataloaderRegistry;
  }
}

export const getDataloaderRegistry = () => {
  const ctx = getContext();
  let registry = ctx[kDataloaderRegistry];
  if (registry == null) {
    registry = new DataloaderRegistry();
    ctx[kDataloaderRegistry] = registry;
  }
  return registry;
};

class DataloaderRegistry {
  private loaders = new Map<string, Dataloader<any, any>>();

  get<K, V, C = K>(
    id: string,
    batchLoadFn: Dataloader.BatchLoadFn<K, V>,
    options?: Dataloader.Options<K, V, C>,
  ): Dataloader<K, V, C> {
    let loader = this.loaders.get(id);
    if (loader != null) {
      return loader;
    }
    loader = new Dataloader(batchLoadFn, options);
    this.loaders.set(id, loader);
    return loader;
  }
}
