const express = require('express');
const app = express();
const port = process.env.PORT;
const pg = require('pg');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.raw({
  inflate: true,
  limit: '256',
  type: 'application/octet-stream'
}));

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

const getConf = (host) => {
  let pool;
  for(let i = 0; i < poolConfs.length; i++) {
    if (poolConfs[i].host === host) return poolConfs[i];
  }

  return pool;
};

const badSql = (sql) => {
  return false;
};

const validateSql = (sql) => {
  return (sql.trim() !== '') && !badSql(sql);
};

app.post('/api/inf/v1/queries/create/:host', async (req, res) => {
  let host = req.params.host;
  let bulks = Buffer(req.body).toString('utf8');
  let sqls = bulks.split(';');

  let conf = getConf(host);
  if (!conf) return res.status(400).json({err: 'ERR_HOST_NOT_FOUND'});

  let result = [];

  for(let i = 0; i < sqls.length; i++) {
    let sql = sqls[i];

    if (validateSql(sql)) {
      try {
        let data = await conf.pool.query(sql);
        result.push(data);
      } catch (e) {
        console.error(e);
        return res.status(400).send('ERR_DB_QUERY');
      }
    }
  }

  res.json({count: result.length});
});

app.post('/api/inf/v1/queries/get/:host', async (req, res) => {
  let host = req.params.host;
  let bulks = Buffer(req.body).toString('utf8');
  let sqls = bulks.split(';');

  let conf = getConf(host);
  if (!conf) return res.status(400).json({err: 'ERR_HOST_NOT_FOUND'});

  let result = [];

  for(let i = 0; i < sqls.length; i++) {
    let sql = sqls[i];

    if (validateSql(sql)) {
      try {
        let data = await conf.pool.query(sql);
        if (data && data.rows) {
          result.push(data.rows);
        }
      } catch (e) {
        console.error(e);
        return res.status(400).send('ERR_DB_QUERY');
      }
    }
  }

  res.json(result);
});

app.post('/api/inf/v1/queries/update/:host', async (req, res) => {
  let host = req.params.host;
  let bulks = Buffer(req.body).toString('utf8');
  let sqls = bulks.split(';');

  let conf = getConf(host);
  if (!conf) return res.status(400).json({err: 'ERR_HOST_NOT_FOUND'});

  let result = [];

  for(let i = 0; i < sqls.length; i++) {
    let sql = sqls[i];

    if (validateSql(sql)) {
      try {
        let data = await conf.pool.query(sql);
        result.push(data);
      } catch (e) {
        console.error(e);
        return res.status(400).send('ERR_DB_QUERY');
      }
    }
  }

  res.json({count: result.length});
});

app.post('/api/inf/v1/jscsv', async (req, res) => {
  let strs = [];

  // data
  for(let i = 0; i < req.body.length; i++) {
    let data = req.body[i];

    Object.keys(data).forEach((key) => {
      strs.push(data[key]);
    });
  }

  res.json(strs);
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});
