const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const statsRoutes = require('./routes/stats.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/stats', statsRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'Chronos Zenith' }));

app.use(errorHandler);

module.exports = app;
