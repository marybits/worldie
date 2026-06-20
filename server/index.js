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

app.use(cors({
  origin: ['http://localhost:5173', 'https://worldie-predictions.vercel.app'],
  credentials: true
}));
console.log('CORS configured for origins:', ['http://localhost:5173', 'https://worldie-predictions.vercel.app']);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});