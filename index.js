const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

let users = []; // Store users in memory
let exercises = []; // Store exercises in memory

// Create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const user = { _id: Date.now().toString(), username };
  users.push(user);
  res.json(user);
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add exercise to a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find((u) => u._id === _id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const exercise = {
    _id,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
  };
  exercises.push({ ...exercise, username: user.username });

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id,
  });
});

// Get exercise log for a user
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find((u) => u._id === _id);
  if (!user) return res.status(404).json({ error: "User not found" });

  let userExercises = exercises.filter((e) => e._id === _id);

  // Apply query filters
  if (from || to) {
    userExercises = userExercises.filter((e) => {
      const exerciseDate = new Date(e.date);
      if (from && exerciseDate < new Date(from)) return false;
      if (to && exerciseDate > new Date(to)) return false;
      return true;
    });
  }

  if (limit) userExercises = userExercises.slice(0, parseInt(limit));

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log: userExercises.map(({ description, duration, date }) => ({
      description,
      duration,
      date,
    })),
  });
});

// Serve HTML file for testing
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
