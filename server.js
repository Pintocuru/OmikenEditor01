require('dotenv').config();
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

app.use(express.json());

app.post('/api/save-state', async (req, res) => {
 try {
  const data = JSON.stringify(req.body, null, 2);
  await fs.writeFile(path.join(__dirname, 'src', 'state.json'), data);
  res.json({ message: 'Data saved successfully' });
 } catch (error) {
  console.error('Error saving data:', error);
  res.status(500).json({ error: 'Failed to save data' });
 }
});

app.listen(8080, () => console.log('Backend server running on port 8080'));