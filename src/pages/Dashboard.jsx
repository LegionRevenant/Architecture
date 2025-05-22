import { useState, useEffect } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db } from '../firebase' // your firebase config file

import WaterTank from '../components/WaterTank'
import StatsCard from '../components/StatsCard'
import MobileNav from '../components/MobileNav'
import SettingsOverlay from '../components/SettingsOverlay'
import Sidebar from '../components/Sidebar'

function Dashboard() {
  // Local state to hold tank data
  const [tankData, setTankData] = useState({
    maxCapacity: 500,
    currentLevel: 0,
    temperature: 0,
    drainageRate: 0,
    dailyUsage: 0,
    monthlyUsage: 0
  })

  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    thresholdType: 'percentage',
    thresholdValue: 20,
    tankCapacity: 500,
    notificationsEnabled: true,
    dataSync: true
  })

  // Firebase listener for tank data
  useEffect(() => {
    const tankRef = ref(db, 'tankData')  // path in your DB

    // Subscribe to changes
    const unsubscribe = onValue(tankRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setTankData(data)
      }
    })

    // Cleanup listener on unmount
    return () => unsubscribe()
  }, [])

  // Function to update tank level in Firebase
  const updateTankLevel = (newLevel) => {
    const tankRef = ref(db, 'tankData/currentLevel')
    set(tankRef, newLevel).catch((error) => {
      console.error("Failed to update tank level:", error)
    })
  }

  const { maxCapacity, currentLevel, temperature, drainageRate, dailyUsage, monthlyUsage } = tankData

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <Sidebar />

      <div className="flex-1 mx-auto max-w-5xl p-4 md:p-6 overflow-auto">
        <MobileNav />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-2/3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Water Level</h2>
              <button
                className="p-2 rounded-full hover:bg-blue-100 transition-colors"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Settings"
              >
                {/* Gear icon svg */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  {/* ...icon path omitted for brevity */}
                </svg>
              </button>
            </div>

            <WaterTank
              capacity={maxCapacity}
              currentLevel={currentLevel}
              onLevelChange={updateTankLevel}
            />

            <div className="my-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Usage:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <h4 className="text-lg font-medium">Daily</h4>
                  <p className="text-2xl font-bold">{dailyUsage} L</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <h4 className="text-lg font-medium">Monthly</h4>
                  <p className="text-2xl font-bold">{monthlyUsage} L</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Tank Stats</h3>
              <div className="space-y-4">
                <StatsCard
                  title="Maximum Capacity"
                  value={maxCapacity}
                  unit="L"
                />
                <StatsCard
                  title="Water Level"
                  value={currentLevel}
                  unit="L"
                />
                <StatsCard
                  title="Temperature"
                  value={temperature}
                  unit="°C"
                />
                <StatsCard
                  title="Drainage Rate"
                  value={drainageRate}
                  unit="ML/s"
                />
              </div>
            </div>
          </div>
        </div>

        <SettingsOverlay
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          initialSettings={settings}
        />
      </div>
    </div>
  )
}

export default Dashboard
