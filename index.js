const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { authenticateToken, authenticateSocket } = require('./middleware');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create a notification model
const notificationSchema = new mongoose.Schema({
  userId: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  type: String,
});

const Notification = mongoose.model('Notification', notificationSchema);

// Start the Express server
const PORT = 4000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Set up Socket.IO with the existing Express server
const io = new Server(server, {
  cors: {
    origin: '*', // Allow CORS for all origins
  },
});

// Use authentication middleware for WebSocket connections
io.use(authenticateSocket);

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected');

  // Extract userId from socket authentication and join a room
  const userId = socket.user.userId; // or any other unique identifier

  // Join the user to a room with their userId
  socket.join(userId);

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.get('/notifications', authenticateToken, async (req, res) => {
  try {
    // Fetch all notifications from the database
    const notifications = await Notification.find({ userId: req.user.userId });

    // Respond with the notifications as a JSON array
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// Protected API endpoint to create a new notification
app.post('/notifications', authenticateToken, async (req, res) => {
  try {
    const { userId, message, type } = req.body;

    // Create a new notification
    const notification = new Notification({ userId, message, type });
    await notification.save();

    // Emit the notification to the specific user's room
    io.to(userId).emit('notification', notification);

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Authentication endpoint to generate JWT
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Replace with your user authentication logic
  if (username === 'John' && password === 'password') {
    // User authenticated successfully
    const user = { userId: 'user1', username }; // Include userId in the payload
    const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ accessToken });
  } else if (username === 'Jane' && password === 'password2') {
    // User authenticated successfully
    const user = { userId: 'user2', username }; // Include userId in the payload
    const accessToken = jwt.sign(user, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    res.json({ accessToken });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});
