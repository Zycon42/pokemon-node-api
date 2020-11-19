import Fastify from 'fastify';

const isProdEnv = process.env.NODE_ENV === 'production';

const app = Fastify({
  logger: {
    prettyPrint: !isProdEnv,
    level: isProdEnv ? 'info' : 'debug',
  },
});

export default app;
