import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, HardDrive, Server } from 'lucide-react';
import './App.css';

function App() {
  const [ramData, setRamData] = useState([]);
  const [cpuData, setCpuData] = useState([]);
  const [currentRAM, setCurrentRAM] = useState(null);
  const [currentCPU, setCurrentCPU] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Función para obtener datos de RAM
  const fetchRAMData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/ram');
      const data = await response.json();
      if (data.length > 0) {
        setCurrentRAM(data[0]);
        setRamData(prev => {
          const newData = [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            usage: data[0].ram_usage_percent,
            total: data[0].total_ram,
            used: data[0].used_ram,
            free: data[0].free_ram
          }];
          return newData.slice(-20); // Mantener solo los últimos 20 puntos
        });
      }
      setIsConnected(true);
    } catch (error) {
      console.error('Error fetching RAM data:', error);
      setIsConnected(false);
    }
  };

  // Función para obtener datos de CPU
  const fetchCPUData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/cpu');
      const data = await response.json();
      if (data.length > 0) {
        setCurrentCPU(data[0]);
        setCpuData(prev => {
          const newData = [...prev, {
            timestamp: new Date().toLocaleTimeString(),
            usage: data[0].cpu_usage_percent,
            processes: data[0].total_processes,
            running: data[0].running_processes,
            cores: data[0].online_cpus
          }];
          return newData.slice(-20); // Mantener solo los últimos 20 puntos
        });
      }
    } catch (error) {
      console.error('Error fetching CPU data:', error);
    }
  };

  // Efecto para obtener datos cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRAMData();
      fetchCPUData();
    }, 5000);

    // Obtener datos inmediatamente
    fetchRAMData();
    fetchCPUData();

    return () => clearInterval(interval);
  }, []);

  // Formatear bytes a formato legible
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

        {/* Métricas actuales */}
        <div className="metrics-grid">
          <MetricCard
            title="Uso de RAM"
            value={currentRAM?.ram_usage_percent || 0}
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
            value={currentCPU?.cpu_usage_percent || 0}
            unit="%"
            icon={Cpu}
            color="#F59E0B"
          />
          <MetricCard
            title="Procesos"
            value={currentCPU?.total_processes || 0}
            unit=""
            icon={Activity}
            color="#EF4444"
          />
        </div>

        {/* Gráficas */}
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
                  <span className="detail-value">{currentRAM.ram_usage_percent}%</span>
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
                  <span className="detail-value">{currentCPU.cpu_usage_percent}%</span>
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