import express from 'express';
import db from './db/database.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

// POST RAM
app.post('/api/ram', (req, res) => {
  const { total_ram, free_ram, used_ram, ram_usage_percent } = req.body;
  db.run(
    `INSERT INTO ram (total_ram, free_ram, used_ram, ram_usage_percent) VALUES (?, ?, ?, ?)`,
    [total_ram, free_ram, used_ram, ram_usage_percent],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// POST CPU
app.post('/api/cpu', (req, res) => {
  const { total_processes, running_processes, online_cpus, cpu_usage_percent } = req.body;
  db.run(
    `INSERT INTO cpu (total_processes, running_processes, online_cpus, cpu_usage_percent) VALUES (?, ?, ?, ?)`,
    [total_processes, running_processes, online_cpus, cpu_usage_percent],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// GET RAM
app.get('/api/ram', (req, res) => {
  db.all(`SELECT * FROM ram ORDER BY timestamp DESC LIMIT 10`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET CPU
app.get('/api/cpu', (req, res) => {
  db.all(`SELECT * FROM cpu ORDER BY timestamp DESC LIMIT 10`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});
