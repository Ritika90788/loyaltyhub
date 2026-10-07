require('dotenv').config();

const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const cors = require('cors');

const connect = require('./config/db');
const { errorHandler } = require('./middleware/auth');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_, res) => res.json({ ok: true }));

app.use('/api', require('./routes'));
app.use('/api', require('./routes/extra'));
app.use('/api', require('./routes/more'));

app.use((req, res) =>
  res.status(404).json({ message: 'Route not found' })
);

app.use(errorHandler);

connect()
  .then(() =>
    app.listen(process.env.PORT || 5000, () =>
      console.log('API running')
    )
  )
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  });