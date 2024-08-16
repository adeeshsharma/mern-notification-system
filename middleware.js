const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT for HTTP requests
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware to authenticate JWT for WebSocket connections
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error('Authentication error'));

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = user;
    next();
  });
};

module.exports = { authenticateToken, authenticateSocket };
