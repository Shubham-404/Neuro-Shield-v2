// app.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const routes = require('./routes');

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN, 
  'https://neuro-shield.netlify.app', 
  'http://localhost:5173', 
  'http://localhost:5174'
].filter(Boolean); // Remove undefined values

// CORS options with dynamic origin checking for better production support
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, or same-origin requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In production, be more strict; in development, allow localhost
      if (process.env.NODE_ENV === 'production') {
        console.warn('CORS: Blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      } else {
        // Development: allow localhost variations
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    }
  },
  credentials: true, // Required to support cookies, authorization headers, etc.
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
};

// Apply the middleware globally
app.use(cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload());

app.use('/api', routes);

// all other routes
app.get(/^.*/, (req, res) => {
  res.status(404).send("404 Page Not Found!")
})
app.post(/^.*/, (req, res) => {
  res.status(404).send("404 Page Not Found!")
})


app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Neuro Shield API running on port ${PORT}`);
});