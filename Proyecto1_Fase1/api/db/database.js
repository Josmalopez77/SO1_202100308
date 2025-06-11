import sqlite3 from 'sqlite3';

import dotenv from 'dotenv';
dotenv.config();

sqlite3.verbose();

const db = new sqlite3.Database(process.env.DB_PATH);


// Crear tablas si no existen
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS ram (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_ram INTEGER,
      free_ram INTEGER,
      used_ram INTEGER,
      ram_usage_percent INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cpu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_processes INTEGER,
      running_processes INTEGER,
      online_cpus INTEGER,
      cpu_usage_percent INTEGER,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

export default db;
