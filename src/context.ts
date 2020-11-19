import { AsyncLocalStorage } from 'async_hooks';
import { FastifyLoggerInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin'

export interface Context {
  reqId: number | string;
  log: FastifyLoggerInstance;
}

const storage = new AsyncLocalStorage<Context>();

export const getContext = () => {
  const ctx = storage.getStore();
  if (ctx == null) {
    throw new Error('No request context!');
  }
  return ctx;
};

export const maybeGetContext = () => {
  return storage.getStore();
};

const contextPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('preHandler', (request, reply, done) => {
    const ctx = { log: request.log, reqId: request.id };
    storage.run(ctx, done);
  });
};

export default fp(contextPlugin, '3.x');
