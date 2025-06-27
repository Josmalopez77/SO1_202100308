import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

// Crear tablas si no existen
await connection.execute(`
  CREATE TABLE IF NOT EXISTS ram (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_ram INT,
    free_ram INT,
    used_ram INT,
    ram_usage_percent INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

await connection.execute(`
  CREATE TABLE IF NOT EXISTS cpu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_processes INT,
    running_processes INT,
    online_cpus INT,
    cpu_usage_percent INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

export default connection;
// docker exec -it mysql mysql -u root -p