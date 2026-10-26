require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const boardsRoutes = require('./routes/boards');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'monday-lite-server' });
});

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardsRoutes);

app.use((err, _req, res, _next) => {
  console.error('[Server Error]:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Monday-Lite Express API listening on http://localhost:${PORT}`);
});
