const express = require('express');
const app = express();
const port = process.env.PORT;
const pg = require('pg');

const poolConfs = process.env.DB_HOSTS.split(' ').map((host) => {
  return {
    host,
    db: process.env.DB_NAME,
    pool: new pg.Pool({
      connectionString: `postgres://postgres:postgres@${host}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      max: 20,
    }),
  };
});

poolConfs.forEach((conf) => {
  conf.pool.on('connect', () => {
    console.log(`Success connected to db on host ${conf.host}`);
  });

  conf.pool.on('error', () => {
    console.error(`Db connection error on host ${conf.host}`);
  });
});

app.get('/', (req, res) => {
  res.json({
    hostname: process.env.HOSTNAME,
    port: process.env.PORT,
    db: `${process.env.DB_NAME}:${process.env.DB_PORT}`,
    redis: `${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  });
});

app.get('/ping', (req, res) => {
  res.send('PONG');
});

app.get('/tests/db', async (req, res) => {
  let connHosts = [];

  for(let i = 0; i < poolConfs.length; i++) {
    let conf = poolConfs[i];

    try {
      let data = await conf.pool.query('select * from pg_stat_activity');

      let stats = data.rows.map((row, index) => {
        return {
          index,
          clientAddress: row.client_addr,
          clientPort: row.client_port,
        };
      });

      connHosts.push({
        host: conf.host,
        db: conf.db,
        numberOfConnection: stats.length,
        stats,
      });
    } catch (e) {
      console.error(e);
      return res.status(400).send('ERR_DB_QUERY');
    }
  }

  res.json(connHosts);
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});
