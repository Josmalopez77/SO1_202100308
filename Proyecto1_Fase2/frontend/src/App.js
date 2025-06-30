import { io } from 'socket.io-client';
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Cpu, HardDrive, Server, Users, Play, Pause, AlertTriangle, Square } from 'lucide-react';
import './App.css';

const socket = io('http://socket:4000');

function App() {
  const [ramData, setRamData] = useState([]);
  const [cpuData, setCpuData] = useState([]);
  const [processData, setProcessData] = useState([]);
  const [currentRAM, setCurrentRAM] = useState(null);
  const [currentCPU, setCurrentCPU] = useState(null);
  const [currentProcesses, setCurrentProcesses] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Manejar conexión
    socket.on('connect', () => {
      console.log('🔗 Conectado al servidor WebSocket');
      setIsConnected(true);
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor WebSocket');
      setIsConnected(false);
    });

    // Manejar errores de conexión
    socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión:', error);
      setIsConnected(false);
    });

    // Manejar métricas recibidas
    socket.on('metrics', (data) => {
      console.log("📡 Datos recibidos vía WebSocket:", data);

      if (data.ram) {
        setCurrentRAM(data.ram);
        setRamData(prev => {
          const newData = [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            usage: data.ram.ram_usage_percent,
            total: data.ram.total_ram,
            used: data.ram.used_ram,
            free: data.ram.free_ram
          }];
          return newData.slice(-20); // Mantener solo los últimos 20 puntos
        });
      }

      if (data.cpu) {
        setCurrentCPU(data.cpu);
        setCpuData(prev => {
          const newData = [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            usage: data.cpu.cpu_usage_percent
          }];
          return newData.slice(-20);
        });
      }

      // Corregir inconsistencia: usar "procesos" como en el socket.on, pero manejar ambos casos
      const processesData = data.procesos || data.processes;
      if (processesData) {
        setCurrentProcesses(processesData);
        setProcessData(prev => {
          const newData = [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            running: processesData.running_processes || processesData.procesos_corriendo,
            total: processesData.total_processes || processesData.total_procesos
          }];
          return newData.slice(-20);
        });
      }
    });

    // Cleanup function
    return () => {
      console.log('🧹 Limpiando listeners y desconectando socket');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('metrics');
    };
  }, []);

  // Formatear bytes a formato legible
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Datos para el gráfico de procesos (pie chart)
  const processChartData = currentProcesses ? [
    { 
      name: 'Corriendo', 
      value: currentProcesses.procesos_corriendo || currentProcesses.running_processes || 0, 
      color: '#10B981' 
    },
    { 
      name: 'Durmiendo', 
      value: currentProcesses.procesos_durmiendo || currentProcesses.sleeping_processes || 0, 
      color: '#3B82F6' 
    },
    { 
      name: 'Zombie', 
      value: currentProcesses.procesos_zombie || currentProcesses.zombie_processes || 0, 
      color: '#EF4444' 
    },
    { 
      name: 'Parados', 
      value: currentProcesses.procesos_parados || currentProcesses.stopped_processes || 0, 
      color: '#F59E0B' 
    }
  ] : [];

  // Componente de tarjeta de métrica
  const MetricCard = ({ title, value, unit, icon: Icon, color }) => (
    <div className="metric-card" style={{ borderLeftColor: color }}>
      <div className="metric-content">
        <div>
          <p className="metric-title">{title}</p>
          <p className="metric-value">{value}{unit}</p>
        </div>
        <Icon className="metric-icon" style={{ color }} />
      </div>
    </div>
  );

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1 className="main-title">Monitor de Servicios Linux</h1>
          <div className="connection-status">
            <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
            <span className="status-text">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>

        {/* Métricas principales */}
        <div className="metrics-grid">
          <MetricCard
            title="Uso de RAM"
            value={currentRAM?.ram_usage_percent?.toFixed(1) || 0}
            unit="%"
            icon={HardDrive}
            color="#3B82F6"
          />
          <MetricCard
            title="RAM Total"
            value={currentRAM ? formatBytes(currentRAM.total_ram) : '0 MB'}
            unit=""
            icon={Server}
            color="#10B981"
          />
          <MetricCard
            title="Uso de CPU"
            value={currentCPU?.cpu_usage_percent?.toFixed(1) || 0}
            unit="%"
            icon={Cpu}
            color="#F59E0B"
          />
          <MetricCard
            title="Total Procesos"
            value={currentProcesses?.total_procesos || currentProcesses?.total_processes || 0}
            unit=""
            icon={Activity}
            color="#EF4444"
          />
        </div>

        {/* Métricas de procesos */}
        <div className="process-metrics-grid">
          <MetricCard
            title="Procesos Corriendo"
            value={currentProcesses?.procesos_corriendo || currentProcesses?.running_processes || 0}
            unit=""
            icon={Play}
            color="#10B981"
          />
          <MetricCard
            title="Procesos Durmiendo"
            value={currentProcesses?.procesos_durmiendo || currentProcesses?.sleeping_processes || 0}
            unit=""
            icon={Pause}
            color="#3B82F6"
          />
          <MetricCard
            title="Procesos Zombie"
            value={currentProcesses?.procesos_zombie || currentProcesses?.zombie_processes || 0}
            unit=""
            icon={AlertTriangle}
            color="#EF4444"
          />
          <MetricCard
            title="Procesos Parados"
            value={currentProcesses?.procesos_parados || currentProcesses?.stopped_processes || 0}
            unit=""
            icon={Square}
            color="#F59E0B"
          />
        </div>

        {/* Gráficas principales */}
        <div className="charts-grid">
          {/* Gráfica de RAM */}
          <div className="chart-container">
            <h2 className="chart-title">Uso de RAM en Tiempo Real</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ramData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}%`, 
                    name === 'usage' ? 'Uso de RAM' : name
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  name="Uso de RAM (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica de CPU */}
          <div className="chart-container">
            <h2 className="chart-title">Uso de CPU en Tiempo Real</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cpuData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}%`, 
                    name === 'usage' ? 'Uso de CPU' : name
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                  name="Uso de CPU (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráficas de procesos */}
        <div className="process-charts-grid">
          {/* Gráfica de línea de procesos corriendo */}
          <div className="chart-container">
            <h2 className="chart-title">Procesos Corriendo en Tiempo Real</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    value, 
                    name === 'running' ? 'Procesos Corriendo' : name
                  ]}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="running" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  name="Procesos Corriendo"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica de pie de distribución de procesos */}
          <div className="chart-container">
            <h2 className="chart-title">Distribución de Procesos</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={processChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {processChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Información detallada */}
        <div className="details-grid">
          {/* Detalles RAM */}
          <div className="details-container">
            <h3 className="details-title">Detalles de RAM</h3>
            {currentRAM ? (
              <div className="details-content">
                <div className="detail-row">
                  <span className="detail-label">Total:</span>
                  <span className="detail-value">{formatBytes(currentRAM.total_ram)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Usado:</span>
                  <span className="detail-value">{formatBytes(currentRAM.used_ram)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Libre:</span>
                  <span className="detail-value">{formatBytes(currentRAM.free_ram)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Porcentaje de uso:</span>
                  <span className="detail-value">{currentRAM.ram_usage_percent?.toFixed(1)}%</span>
                </div>
              </div>
            ) : (
              <p className="no-data">Sin datos disponibles</p>
            )}
          </div>

          {/* Detalles CPU */}
          <div className="details-container">
            <h3 className="details-title">Detalles de CPU</h3>
            {currentCPU ? (
              <div className="details-content">
                <div className="detail-row">
                  <span className="detail-label">Núcleos online:</span>
                  <span className="detail-value">{currentCPU.online_cpus}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Procesos totales:</span>
                  <span className="detail-value">{currentCPU.total_processes}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Procesos ejecutándose:</span>
                  <span className="detail-value">{currentCPU.running_processes}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Porcentaje de uso:</span>
                  <span className="detail-value">{currentCPU.cpu_usage_percent?.toFixed(1)}%</span>
                </div>
              </div>
            ) : (
              <p className="no-data">Sin datos disponibles</p>
            )}
          </div>

          {/* Detalles Procesos */}
          <div className="details-container">
            <h3 className="details-title">Detalles de Procesos</h3>
            {currentProcesses ? (
              <div className="details-content">
                <div className="detail-row">
                  <span className="detail-label">Total de procesos:</span>
                  <span className="detail-value">{currentProcesses.total_procesos || currentProcesses.total_processes}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Procesos corriendo:</span>
                  <span className="detail-value status-running">
                    {currentProcesses.procesos_corriendo || currentProcesses.running_processes}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Procesos durmiendo:</span>
                  <span className="detail-value status-sleeping">
                    {currentProcesses.procesos_durmiendo || currentProcesses.sleeping_processes}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Procesos zombie:</span>
                  <span className="detail-value status-zombie">
                    {currentProcesses.procesos_zombie || currentProcesses.zombie_processes}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Procesos parados:</span>
                  <span className="detail-value status-stopped">
                    {currentProcesses.procesos_parados || currentProcesses.stopped_processes}
                  </span>
                </div>
              </div>
            ) : (
              <p className="no-data">Sin datos disponibles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;