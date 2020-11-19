/// <reference path="./schema-types.d.ts" />
import './load-config';
import path from 'path';
import { makeSchema, connectionPlugin } from '@nexus/schema';
import mercurius from 'mercurius';
import app from './app';
import { configureDb } from './config/db';
import context from './context';

import * as pokemonSchema from './pokemon/pokemon.schema';
import * as commonSchema from './common/common.schema';

process.on('unhandledRejection', (reason, p) => {
  app.log.fatal({ err: reason, promise: p }, 'Unhandled promise rejection');
  process.exit(1);
});

async function bootstrap() {
  const schema = makeSchema({
    types: [pokemonSchema, commonSchema],
    outputs: {
      schema: path.join(__dirname, '../schema.graphql'),
      typegen: path.join(__dirname, './schema-types.d.ts'),
    },
    prettierConfig: path.join(__dirname, '../.prettierrc'),
    plugins: [
      connectionPlugin({ includeNodesField: true, disableBackwardPagination: true }),
    ]
  });
  app.register(mercurius, { schema, graphiql: 'playground' });

  app.register(context);
  const knex = configureDb(app);
  app.addHook('onClose', (server, done) => {
    knex.destroy(done);
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
}

bootstrap().catch((err) => {
  app.log.fatal({ err }, 'Failed to start server!');
  process.exit(1);
});
