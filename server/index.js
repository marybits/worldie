const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('./config/passport');
const passport = require('passport');

connectDB();

const startCronJobs = require('./config/cron');
startCronJobs();

const app = express();

// Build the allowed origins list from environment variables.
// In production, set CLIENT_URL=https://your-domain.vercel.app in the server's env config.
// In dev, localhost:5173 (Vite's default) is always allowed.
const allowedOrigins = ['http://localhost:5173'];
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/matches', require('./routes/matches').router);
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/leaderboard', require('./routes/leaderboard'));


app.get('/', (req, res) => {
  res.json({ message: 'Worldie API running ⚽' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});