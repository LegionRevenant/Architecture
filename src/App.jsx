import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import LogsView from './pages/LogsView';

function App() {
  const [tankData, setTankData] = useState({
    maxCapacity: 600,
    currentLevel: 350,
    temperature: 22,
    drainageRate: 0,
    dailyUsage: 0,
    monthlyUsage: 0
  });

  const updateTankLevel = (newLevel) => {
    setTankData(prev => ({
      ...prev,
      currentLevel: newLevel
    }));
  };

  return (
    <Routes>
      <Route index element={<LoginPage />} />
        <Route path="/dashboard"element={<Dashboard tankData={tankData} updateTankLevel={updateTankLevel} />} />
        <Route path="/logs" element={<LogsView />} />
    </Routes>
  );
}

export default App;