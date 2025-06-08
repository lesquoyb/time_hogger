import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'timehogger-data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
await fs.ensureDir(path.dirname(DATA_FILE));

// Initialize data file if it doesn't exist
const initializeDataFile = async () => {
  try {
    await fs.access(DATA_FILE);
  } catch (error) {
    // File doesn't exist, create it with empty data
    const initialData = {
      persons: [],
      lastUpdated: new Date().toISOString()
    };
    await fs.writeJson(DATA_FILE, initialData, { spaces: 2 });
    console.log('Initialized data file:', DATA_FILE);
  }
};

// Helper function to read data
const readData = async () => {
  try {
    const data = await fs.readJson(DATA_FILE);
    return data;
  } catch (error) {
    console.error('Error reading data:', error);
    return { persons: [], lastUpdated: new Date().toISOString() };
  }
};

// Helper function to write data
const writeData = async (data) => {
  try {
    data.lastUpdated = new Date().toISOString();
    await fs.writeJson(DATA_FILE, data, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('Error writing data:', error);
    return false;
  }
};

// API Routes

// Get all persons data
app.get('/api/persons', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.persons);
  } catch (error) {
    console.error('Error getting persons:', error);
    res.status(500).json({ error: 'Failed to retrieve persons data' });
  }
});

// Save all persons data
app.post('/api/persons', async (req, res) => {
  try {
    const persons = req.body;
    if (!Array.isArray(persons)) {
      return res.status(400).json({ error: 'Invalid data format. Expected array of persons.' });
    }

    const data = await readData();
    data.persons = persons;
    
    const success = await writeData(data);
    if (success) {
      res.json({ message: 'Data saved successfully', lastUpdated: data.lastUpdated });
    } else {
      res.status(500).json({ error: 'Failed to save data' });
    }
  } catch (error) {
    console.error('Error saving persons:', error);
    res.status(500).json({ error: 'Failed to save persons data' });
  }
});

// Get specific person by ID
app.get('/api/persons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readData();
    const person = data.persons.find(p => p.id === parseInt(id));
    
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    res.json(person);
  } catch (error) {
    console.error('Error getting person:', error);
    res.status(500).json({ error: 'Failed to retrieve person data' });
  }
});

// Update specific person
app.put('/api/persons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPerson = req.body;
    
    const data = await readData();
    const personIndex = data.persons.findIndex(p => p.id === parseInt(id));
    
    if (personIndex === -1) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    data.persons[personIndex] = { ...data.persons[personIndex], ...updatedPerson };
    
    const success = await writeData(data);
    if (success) {
      res.json({ message: 'Person updated successfully', person: data.persons[personIndex] });
    } else {
      res.status(500).json({ error: 'Failed to update person' });
    }
  } catch (error) {
    console.error('Error updating person:', error);
    res.status(500).json({ error: 'Failed to update person data' });
  }
});

// Delete person
app.delete('/api/persons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const data = await readData();
    const personIndex = data.persons.findIndex(p => p.id === parseInt(id));
    
    if (personIndex === -1) {
      return res.status(404).json({ error: 'Person not found' });
    }
    
    data.persons.splice(personIndex, 1);
    
    const success = await writeData(data);
    if (success) {
      res.json({ message: 'Person deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete person' });
    }
  } catch (error) {
    console.error('Error deleting person:', error);
    res.status(500).json({ error: 'Failed to delete person' });
  }
});

// Backup endpoint
app.post('/api/backup', async (req, res) => {
  try {
    const data = await readData();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(__dirname, 'data', `backup-${timestamp}.json`);
    
    await fs.writeJson(backupFile, data, { spaces: 2 });
    res.json({ message: 'Backup created successfully', filename: path.basename(backupFile) });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    dataFile: DATA_FILE
  });
});

// Initialize and start server
const startServer = async () => {
  await initializeDataFile();
  
  app.listen(PORT, () => {
    console.log(`🚀 TimeHogger API server running on port ${PORT}`);
    console.log(`📁 Data file: ${DATA_FILE}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer().catch(console.error);
