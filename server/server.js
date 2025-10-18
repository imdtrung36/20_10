const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Data files
const flowersDataPath = path.join(__dirname, 'data', 'flowers.json');
const messagesDataPath = path.join(__dirname, 'data', 'messages.json');

// Initialize messages file if it doesn't exist
if (!fs.existsSync(messagesDataPath)) {
  fs.writeFileSync(messagesDataPath, JSON.stringify([], null, 2));
}

// Helper function to read JSON data
const readJsonData = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

// Helper function to write JSON data
const writeJsonData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Routes

// Get all flowers
app.get('/api/flowers', (req, res) => {
  try {
    const flowers = readJsonData(flowersDataPath);
    res.json(flowers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flowers' });
  }
});

// Get all messages
app.get('/api/messages', (req, res) => {
  try {
    const messages = readJsonData(messagesDataPath);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Add new message
app.post('/api/messages', (req, res) => {
  try {
    const { name, message } = req.body;
    
    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' });
    }

    const messages = readJsonData(messagesDataPath);
    const newMessage = {
      id: Date.now(),
      name: name.trim(),
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    messages.push(newMessage);
    
    if (writeJsonData(messagesDataPath, messages)) {
      res.status(201).json(newMessage);
    } else {
      res.status(500).json({ error: 'Failed to save message' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add message' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Flowers API: http://localhost:${PORT}/api/flowers`);
  console.log(`Messages API: http://localhost:${PORT}/api/messages`);
});
