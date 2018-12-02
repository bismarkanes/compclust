const express = require('express');
const app = express();
const port = process.env.PORT;
const pg = require('pg');
const client = new pg.Client({
  connectionString: `postgres://postgres:postgres@${process.env.DB_HOST}:${process.env.DB_PORT}/postgres`,
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
  client.connect((err) => {
    if (err) {
      return res.status(400).send('ERROR DB Connection!');
    }

    res.send('DB connection success!');
    client.end();
  });
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});
