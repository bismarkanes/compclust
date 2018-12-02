const express = require('express');
const app = express();
const port = process.env.PORT;

app.get('/', (req, res) => {
  res.json({
    hostname: process.env.HOSTNAME,
    port: process.env.PORT,
  });
});

app.get('/ping', (req, res) => {
  res.send('PONG');
});

app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});
