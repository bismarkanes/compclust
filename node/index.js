const express = require('express');
const app = express();
const port = process.env.PORT;
const pg = require('pg');
const pool = new pg.Pool({
  connectionString: `postgres://postgres:postgres@${process.env.DB_HOST}:${process.env.DB_PORT}/postgres`,
  max: 20,
});

pool.on('connect', () => {
  console.log('Success connected to db');
});

pool.on('error', () => {
  console.error('Db connection error');
});

app.get('/', (req, res) => {
  res.json({
    hostname: process.env.HOSTNAME,
    port: process.env.PORT,
    db: `${process.env.DB_HOST}:${process.env.DB_PORT}`,
    redis: `${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  });
});

app.get('/ping', (req, res) => {
  res.send('PONG');
});

app.get('/tests/db', (req, res) => {
  pool.query('select * from pg_stat_activity').then((data) => {
    let stats = data.rows.map((row, index) => {
      return {
        index,
        clientAddress: row.client_addr,
        clientPort: row.client_port,
      };
    });

    res.json({
      numberOfConnection: stats.length,
      stats,
    });
  }).catch((err) => {
    console.error(err);
    res.status(400).send('ERR_DB_QUERY');
  });
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});
