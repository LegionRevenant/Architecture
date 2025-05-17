import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import LogsView from './pages/LogsView'

function App() {
  const [tankData, setTankData] = useState({
    maxCapacity: 500,
    currentLevel: 350,
    temperature: 22,
    drainageRate: 0,
    dailyUsage: 0,
    monthlyUsage: 0
  })

  const updateTankLevel = (newLevel) => {
    setTankData(prev => ({
      ...prev,
      currentLevel: newLevel
    }))
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard tankData={tankData} updateTankLevel={updateTankLevel} />} />
        <Route path="logs" element={<LogsView />} />
      </Route>
    </Routes>
  )
}

export default App