import express from 'express';
import cors from 'cors';
import { pool } from './db.js';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

app.post('/api/ram', async (req, res) => {
  try {
    const { total_ram, free_ram, used_ram, ram_usage_percent } = req.body;
    await pool.query(
      'INSERT INTO ram (total_ram, free_ram, used_ram, ram_usage_percent, api) VALUES (?, ?, ?, ?, ?)',
      [total_ram, free_ram, used_ram, ram_usage_percent, 'NodeJS'] 
    );
    res.status(200).json({ message: 'RAM guardada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar RAM' });
  }
});

app.post('/api/cpu', async (req, res) => {
  try {
    const { total_processes, running_processes, online_cpus, cpu_usage_percent } = req.body;
    await pool.query(
      'INSERT INTO cpu (total_processes, running_processes, online_cpus, cpu_usage_percent, api) VALUES (?, ?, ?, ?, ?)',
      [total_processes, running_processes, online_cpus, cpu_usage_percent, 'NodeJS']
    );
    res.status(200).json({ message: 'CPU guardada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar CPU' });
  }
});

app.post('/api/procesos', async (req, res) => {
  try {
    const {
      total_procesos,
      procesos_corriendo,
      procesos_durmiendo,
      procesos_zombie,
      procesos_parados
    } = req.body;
    await pool.query(
      'INSERT INTO procesos (total_procesos, procesos_corriendo, procesos_durmiendo, procesos_zombie, procesos_parados, api) VALUES (?, ?, ?, ?, ?, ?)',
      [total_procesos, procesos_corriendo, procesos_durmiendo, procesos_zombie, procesos_parados, 'NodeJS']
    );
    res.status(200).json({ message: 'Procesos guardados' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar procesos' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Node REST corriendo en http://localhost:${PORT}`);
});
