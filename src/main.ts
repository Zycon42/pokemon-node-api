import path from 'path';
import { makeSchema } from '@nexus/schema';
import Fastify from 'fastify';
import mercurius from 'mercurius';

import * as pokemonSchema from './pokemon/pokemon.schema';

const isProdEnv = process.env.NODE_ENV === 'production';

const app = Fastify({
  logger: {
    prettyPrint: !isProdEnv,
    level: isProdEnv ? 'info' : 'debug',
  },
});

process.on('unhandledRejection', (reason, p) => {
  app.log.error({ err: reason, promise: p }, 'Unhandled promise rejection');
});

async function bootstrap() {
  const schema = makeSchema({
    types: [pokemonSchema],
    outputs: {
      schema: path.join(__dirname, '../schema.graphql'),
      typegen: path.join(__dirname, '../src/schema-types.d.ts'),
    },
    prettierConfig: path.join(__dirname, '../.prettierrc'),
  });
  app.register(mercurius, { schema, graphiql: 'playground' });

  const port = process.env.PORT || 4000;
  await app.listen(port);
}

bootstrap().catch((err) => {
  app.log.fatal({ err }, 'Failed to start server!');
  process.exit(1);
});
