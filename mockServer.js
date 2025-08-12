import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const users = new Map();
const messages = [];

function generateToken(username) {
  return Buffer.from(username).toString('base64');
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  const username = Buffer.from(token, 'base64').toString();
  if (!users.has(username)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.user = { username };
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
  users.set(username, password);
  const token = generateToken(username);
  res.json({ token });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (users.get(username) !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = generateToken(username);
  res.json({ token });
});

app.get('/api/messages', authMiddleware, (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const start = (page - 1) * limit;
  const data = messages.slice(start, start + limit);
  res.json({ data, page, total: messages.length });
});

app.post('/api/messages', authMiddleware, (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }
  const userMessage = {
    id: messages.length + 1,
    role: 'user',
    content: message,
    timestamp: Date.now()
  };
  messages.push(userMessage);
  const botMessage = {
    id: messages.length + 1,
    role: 'bot',
    content: `Echo: ${message}`,
    timestamp: Date.now()
  };
  messages.push(botMessage);
  res.json({ reply: botMessage.content });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Mock API server listening on port ${port}`);
});
