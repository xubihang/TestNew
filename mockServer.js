import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// username -> { password, messages: [] }
const users = new Map();

function generateToken(username) {
  return Buffer.from(username).toString('base64');
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  const username = Buffer.from(token, 'base64').toString();
  const user = users.get(username);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = user;
  req.username = username;
  next();
}

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }
  if (users.has(username)) {
    return res.status(400).json({ error: 'User exists' });
  }
  users.set(username, { password, messages: [] });
  const token = generateToken(username);
  res.json({ token });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.get(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = generateToken(username);
  res.json({ token });
});

app.get('/api/messages', authMiddleware, (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const start = (page - 1) * limit;
  const userMessages = req.user.messages;
  const data = userMessages.slice(start, start + limit);
  res.json({ data, page, total: userMessages.length });
});

app.post('/api/messages', authMiddleware, (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }
  const userMessages = req.user.messages;
  const userMessage = {
    id: userMessages.length + 1,
    role: 'user',
    content: message,
    timestamp: Date.now()
  };
  userMessages.push(userMessage);
  const botMessage = {
    id: userMessages.length + 1,
    role: 'bot',
    content: `Echo: ${message}`,
    timestamp: Date.now()
  };
  userMessages.push(botMessage);
  res.json({ reply: botMessage.content });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Mock API server listening on port ${port}`);
});
