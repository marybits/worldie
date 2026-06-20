const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
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

// Swagger — API documentation available at /api/docs
// swaggerJsdoc scans the route files for /** @swagger */ comments and builds
// a JSON spec from them. swaggerUi then renders that spec as an interactive page.
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',          // OpenAPI version (3.0 is the current standard)
    info: {
      title: 'Worldie API',
      version: '1.0.0',
      description: 'REST API for the Worldie World Cup predictions app',
    },
    servers: [
      { url: 'http://localhost:8080', description: 'Local dev' },
      { url: 'https://worldie-api.onrender.com', description: 'Production' },
    ],
    // Components define reusable pieces — here we define the JWT bearer scheme
    // so every protected endpoint can reference it with: security: [{ bearerAuth: [] }]
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Tell swagger-jsdoc where to look for @swagger comments
  apis: ['./routes/*.js'],
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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