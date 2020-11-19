import { FastifyInstance } from 'fastify';
import Knex from 'knex';
import { Model, knexSnakeCaseMappers } from 'objection';
import { maybeGetContext } from '../context';

export function configureDb(app: FastifyInstance): Knex {
  const getLogger = () => {
    const ctx = maybeGetContext();
    if (!ctx) {
      return app.log;
    }
    return ctx.log;
  };

  const log: Knex.Logger = {
    error(msg) {
      getLogger().error(msg);
    },
    warn(msg) {
      getLogger().warn(msg);
    },
    deprecate(msg) {
      getLogger().warn(msg);
    },
    debug(msg) {
      if (typeof msg === 'object') {
        const { sql, ...obj } = msg;
        getLogger().debug(obj, sql || 'knex debug');
      } else {
        getLogger().debug(msg);
      }
    }
  };
  const knex = Knex({
    client: 'pg',
    connection: process.env.DATABASE_CONNECTION,
    debug: process.env.NODE_ENV !== "production",
    log,
    ...knexSnakeCaseMappers()
  });
  Model.knex(knex);
  return knex;
}
