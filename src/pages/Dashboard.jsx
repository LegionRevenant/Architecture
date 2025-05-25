import { useState, useEffect } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { db, firestore } from '../firebase'
import {
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore'
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  format,
  isWithinInterval,
  parseISO
} from 'date-fns'

import WaterTank from '../components/WaterTank'
import StatsCard from '../components/StatsCard'
import MobileNav from '../components/MobileNav'
import SettingsOverlay from '../components/SettingsOverlay'
import Sidebar from '../components/Sidebar'

function Dashboard() {
  const [tankData, setTankData] = useState({
    maxCapacity: 500,
    currentLevel: 0,
    temperature: 0,
    drainageRate: 0,
  })

  const [totalDailyUsage, setTotalDailyUsage] = useState(0)
  const [totalWeeklyUsage, setTotalWeeklyUsage] = useState(0)
  const [totalMonthlyUsage, setTotalMonthlyUsage] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    thresholdType: 'percentage',
    thresholdValue: 20,
    tankCapacity: 500,
    notificationsEnabled: true,
    dataSync: true
  })

  // Fetch real-time tank data
  useEffect(() => {
    const tankRef = ref(db, 'tankData')
    const unsubscribe = onValue(tankRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const { dailyUsage, monthlyUsage, ...rest } = data
        setTankData(rest)
      }
    })
    return () => unsubscribe()
  }, [])

  // Fetch usage from daily_usage
  useEffect(() => {
    async function fetchUsageFromDailyDocs() {
      const usageRef = collection(firestore, 'daily_usage')
      const snapshot = await getDocs(usageRef)
      const allDocs = snapshot.docs.map(doc => doc.data())

      const now = new Date()
      const todayStr = format(now, 'yyyy-MM-dd')

      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

      const monthStart = startOfMonth(now)
      const monthEnd = endOfMonth(now)

      let daily = 0
      let weekly = 0
      let monthly = 0

      allDocs.forEach(doc => {
        const date = parseISO(doc.date)
        const usage = Number(doc.totalUsage || 0)

        if (doc.date === todayStr) {
          daily += usage
        }
        if (isWithinInterval(date, { start: weekStart, end: weekEnd })) {
          weekly += usage
        }
        if (isWithinInterval(date, { start: monthStart, end: monthEnd })) {
          monthly += usage
        }
      })

      setTotalDailyUsage(daily)
      setTotalWeeklyUsage(weekly)
      setTotalMonthlyUsage(monthly)
    }

    fetchUsageFromDailyDocs()
  }, [])

  const updateTankLevel = (newLevel) => {
    const tankRef = ref(db, 'tankData/currentLevel')
    set(tankRef, newLevel).catch((error) => {
      console.error('Failed to update tank level:', error)
    })
  }

  const { maxCapacity, currentLevel, temperature } = tankData

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <Sidebar />

      <div className="flex-1 mx-auto max-w-5xl p-4 md:p-6 overflow-auto">
        <MobileNav />

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Water Level</h2>
          <button
            className="p-2 rounded-full hover:bg-blue-100 transition-colors"
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.142-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.806.272 1.203.107.397-.165.71-.505.781-.929l.149-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <WaterTank
          capacity={maxCapacity}
          currentLevel={currentLevel}
          onLevelChange={updateTankLevel}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <StatsCard title="Max Capacity" value={maxCapacity} unit="L" />
          <StatsCard title="Current Level" value={currentLevel} unit="L" />
          <StatsCard title="Temperature" value={temperature} unit="°C" />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Usage</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-lg font-medium">Daily</h4>
              <p className="text-2xl font-bold">{totalDailyUsage} L</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-lg font-medium">Weekly</h4>
              <p className="text-2xl font-bold">{totalWeeklyUsage} L</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-lg font-medium">Monthly</h4>
              <p className="text-2xl font-bold">{totalMonthlyUsage} L</p>
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
