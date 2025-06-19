const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const achievementRoutes = require('./routes/achievementRoutes');
const challengeRoutes = require('./routes/challengeRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const musicRoutes = require('./routes/musicRoutes');

require('dotenv').config();
const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/achievements', achievementRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/music', musicRoutes);

// Error handler
app.use(errorHandler);

app.listen(PORT, '0.0.0.0',() => {
  console.log(`Server is running on port ${PORT}and accessible from network`);
});
