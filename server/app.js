// Required packages
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require('cors');

// Create the Express app
var app = express();

// CORS setup
app.use(cors({
  origin: 'http://localhost:3002', // Replace with your React app's origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add other methods if needed
  credentials: true // If you need to pass cookies or authentication headers
}));

// Check for uploads directory and create if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("Uploads directory created.");
}

// MongoDB connection
mongoose.connect("mongodb+srv://sasikenway18:Sasi%4018121996@sasikenway.g2slxbd.mongodb.net/resume_editor?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log("MongoDB connection error:", err));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Import routes after the app has been defined
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const resumeRoutes = require("./routes/resumeRoutes");

// Use routes
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/resume", resumeRoutes);
// Serve files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Start the server
const port = process.env.PORT || 3001; // Ensure the server uses port 3001
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

module.exports = app;
