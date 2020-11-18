import express from 'express';
require('dotenv').config();

const app = express();

const fileMap = new Map<string, string[]>();

app.use(express.json());

app.get('/leech', (req, res) => {
  const { name } = req.query;
  const { auth } = req.headers;
  if (auth !== process.env.PW) {
    return res.status(401).send('Not authorized.');
  }
  if (typeof name !== 'string') {
    return res.status(400).send('File name not provided.');
  }

  const ipList = fileMap.get(name);
  if (!ipList) {
    return res.send('Inexistent file.');
  }

  return res.send(ipList);
});

app.post('/seed', (req, res) => {
  const { ip, name } = req.body;
  const { auth } = req.headers;
  if (auth !== process.env.PW) {
    return res.status(401).send('Not authorized.');
  }

  if (!name) {
    return res.status(400).send('File name not provided.');
  }
  const ipRe = new RegExp(/^(\d{1,3}\.){3}\d{1,3}:\d{2,4}$/);
  if (!ipRe.test(ip)) {
    return res.status(400).send('Invalid IPv4 address provided.');
  }

  const ipList = fileMap.get(name);
  if (!ipList) {
    fileMap.set(name, [ip]);
  } else {
    fileMap.set(name, ipList.concat(ip));
  }

  return res.send('Seeder added.');
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Running on', port));
