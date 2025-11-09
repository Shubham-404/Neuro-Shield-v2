// app.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const routes = require('./routes');

const app = express();

const allowedOrigins = [process.env.FRONTEND_ORIGIN, 'http://localhost:5173'];

// CORS options object
const corsOptions = {
  origin: allowedOrigins,
  credentials: true // Required to support cookies, authorization headers, etc.
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