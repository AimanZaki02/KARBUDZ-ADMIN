require('dotenv').config();

// MongoDB Connection
const mongoose = require("mongoose");
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection error:', err));

// Load required modules
const express = require("express");
const MongoStore = require("connect-mongo");
const passport = require('passport');
const flash = require("connect-flash");
const flashmiddleware = require('./config/flash');
const session = require('express-session');
const path = require("path");
const adminRoute = require("./routes/adminRoutes");
const apiRoute = require("./routes/apiRoutes");

// Initialize Express app
const app = express();
app.use(express.json());

// Set Session and Passport
app.use(session({
    secret: process.env.SESSION_SECREAT,
    resave: false,
    saveUninitialized: true,
    rolling: true, 
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    store: MongoStore.create({
        mongoUrl: process.env.DB_CONNECTION,
        ttl: 3600,
    }),
}));

// Store User in locals
app.use((req, res, next) => {
    res.locals.user = req.session.user_id;
    next();
});

// Passport Config
app.use(passport.session());
app.use(passport.initialize());

// Set Flash
app.use(flash());
app.use(flashmiddleware.setflash);

// Setting the static files
app.use(express.static(path.join(__dirname, 'public')));

// Set Routes
app.use('/', adminRoute);
app.use('/api', apiRoute);

// Start Server
app.listen(process.env.PORT, () => {
    console.log(`Server is Running on ${process.env.PORT}`);
});
