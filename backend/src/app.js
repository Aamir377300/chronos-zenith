const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const taskRoutes = require('./routes/task.routes');
const statsRoutes = require('./routes/stats.routes');
const { requirePasscode } = require('./middleware/passcode');
const { getMe } = require('./controllers/owner.controller');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'Chronos Zenith' }));

// Single-user profile (streak / rating)
app.get('/me', requirePasscode, getMe);

app.use('/tasks', taskRoutes);
app.use('/stats', statsRoutes);

app.use(errorHandler);

module.exports = app;
