import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { pool } from './db.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { 
    origin: [
      'http://frontend:3000',
      'https://frontend2-883666132310.us-central1.run.app',
    ], 
    methods: ['GET', 'POST']
  }
});

let clientesConectados = 0;

io.on('connection', (socket) => {
  clientesConectados++;
  console.log(`🟢 Cliente conectado: ${socket.id} (Total: ${clientesConectados})`);
  
  // Enviar datos inmediatamente al conectarse
  emitirDatosACliente(socket);
  
  socket.on('disconnect', () => {
    clientesConectados--;
    console.log(`🔴 Cliente desconectado: ${socket.id} (Total: ${clientesConectados})`);
  });
});

async function emitirDatosACliente(socket = null) {
  try {
    // Verificar si hay datos en las tablas
    const [ramRows] = await pool.query('SELECT * FROM ram ORDER BY id DESC LIMIT 1');
    const [cpuRows] = await pool.query('SELECT * FROM cpu ORDER BY id DESC LIMIT 1');
    const [procRows] = await pool.query('SELECT * FROM procesos ORDER BY id DESC LIMIT 1');

    // Verificar que tengamos datos
    if (ramRows.length === 0 || cpuRows.length === 0 || procRows.length === 0) {
      console.log('⚠️  No hay datos suficientes en la base de datos');
      console.log(`RAM: ${ramRows.length}, CPU: ${cpuRows.length}, Procesos: ${procRows.length}`);
      return;
    }

    const datos = {
      ram: ramRows[0],
      cpu: cpuRows[0],
      procesos: procRows[0],
      timestamp: new Date().toISOString()
    };

    // Si se especifica un socket, enviar solo a ese cliente
    if (socket) {
      socket.emit('metrics', datos);
      console.log(`📡 Datos enviados al cliente ${socket.id}`);
    } else {
      // Enviar a todos los clientes conectados
      if (clientesConectados > 0) {
        io.emit('metrics', datos);
        console.log(`📡 Datos enviados a ${clientesConectados} cliente(s)`);
      }
    }

  } catch (error) {
    console.error("❌ Error consultando la base de datos:", error.message);
    
    // Enviar error a los clientes si es necesario
    const errorData = {
      error: 'Error en la base de datos',
      message: error.message,
      timestamp: new Date().toISOString()
    };
    
    if (socket) {
      socket.emit('error', errorData);
    } else {
      io.emit('error', errorData);
    }
  }
}

// Función para emitir datos a todos los clientes
async function emitirDatos() {
  await emitirDatosACliente();
}

// Ejecuta cada 5 segundos solo si hay clientes conectados
const interval = setInterval(() => {
  if (clientesConectados > 0) {
    emitirDatos();
  } else {
    console.log('⏸️  No hay clientes conectados, pausando envío de datos');
  }
}, 5000);

// Ruta de prueba para verificar que el servidor está corriendo
app.get('/status', (req, res) => {
  res.json({
    status: 'OK',
    clientesConectados,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  clearInterval(interval);
  io.close();
  httpServer.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

httpServer.listen(4000, () => {
  console.log('✅ WebSocket API corriendo en http://localhost:4000');
  console.log('📊 Endpoint de estado: http://localhost:4000/status');
});