require('dotenv-safe').config({
  allowEmptyValues: true
});
require('ts-node').register();

module.exports = {  
  client: 'pg',
  connection: process.env.DATABASE_CONNECTION,
  migrations: {
    extension: 'ts',
  },
  seeds: {
    extension: 'ts',
  },
  debug: process.env.NODE_ENV !== "production"
};
