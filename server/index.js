const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('./config/passport');
const passport = require('passport');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/leaderboard', require('./routes/leaderboard'));


app.get('/', (req, res) => {
  res.json({ message: 'Worldie API running ⚽' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});