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
app.post('/api/ram', async (req, res) => {
    const { total_ram, free_ram, used_ram, ram_usage_percent } = req.body;
    
    // Validación de datos
    if (!total_ram || !free_ram || !used_ram || ram_usage_percent === undefined) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    try {
        const [result] = await db.execute(
            `INSERT INTO ram (total_ram, free_ram, used_ram, ram_usage_percent) VALUES (?, ?, ?, ?)`,
            [total_ram, free_ram, used_ram, ram_usage_percent]
        );
        
        console.log('RAM insertada correctamente:', result.insertId);
        res.json({ 
            id: result.insertId, 
            message: 'Datos de RAM insertados correctamente' 
        });
    } catch (err) {
        console.error('Error al insertar RAM:', err);
        res.status(500).json({ error: err.message });
    }
});

// POST CPU
app.post('/api/cpu', async (req, res) => {
    const { total_processes, running_processes, online_cpus, cpu_usage_percent } = req.body;
    
    // Validación de datos
    if (!total_processes || !running_processes || !online_cpus || cpu_usage_percent === undefined) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    try {
        const [result] = await db.execute(
            `INSERT INTO cpu (total_processes, running_processes, online_cpus, cpu_usage_percent) VALUES (?, ?, ?, ?)`,
            [total_processes, running_processes, online_cpus, cpu_usage_percent]
        );
        
        console.log('CPU insertada correctamente:', result.insertId);
        res.json({ 
            id: result.insertId, 
            message: 'Datos de CPU insertados correctamente' 
        });
    } catch (err) {
        console.error('Error al insertar CPU:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET RAM
app.get('/api/ram', async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT * FROM ram ORDER BY timestamp DESC LIMIT 10`);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener datos de RAM:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET CPU
app.get('/api/cpu', async (req, res) => {
    try {
        const [rows] = await db.execute(`SELECT * FROM cpu ORDER BY timestamp DESC LIMIT 10`);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener datos de CPU:', err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint para verificar la conexión
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API funcionando correctamente' });
});

app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`);
});