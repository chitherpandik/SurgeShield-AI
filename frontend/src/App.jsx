import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AnalyzeTransaction from './pages/AnalyzeTransaction';
import Transactions from './pages/Transactions';
import TransactionDetails from './pages/TransactionDetails';
import RiskIntelligence from './pages/RiskIntelligence';
import SystemHealth from './pages/SystemHealth';
import { getHealth } from './services/api';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);

  // Background health polling
  const fetchHealthStatus = async () => {
    try {
      const data = await getHealth();
      setHealthData(data);
      setLastUpdated(new Date());
    } catch {
      setHealthData({ status: 'degraded', service: 'SurgeShield AI', database: 'disconnected' });
    }
  };

  useEffect(() => {
    fetchHealthStatus();
    const interval = setInterval(fetchHealthStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Sidebar Navigation */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="main-content">
          <Navbar
            healthData={healthData}
            lastUpdated={lastUpdated}
            refreshing={false}
            onRefresh={fetchHealthStatus}
            isAutoRefreshEnabled={isAutoRefreshEnabled}
            onToggleAutoRefresh={() => setIsAutoRefreshEnabled((prev) => !prev)}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          />

          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analyze" element={<AnalyzeTransaction />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/transactions/:id" element={<TransactionDetails />} />
              <Route path="/risk-summary" element={<RiskIntelligence />} />
              <Route path="/risk-intelligence" element={<Navigate to="/risk-summary" replace />} />
              <Route path="/system-health" element={<SystemHealth />} />
              <Route path="/health" element={<Navigate to="/system-health" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

