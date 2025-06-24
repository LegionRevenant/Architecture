import { useState, useEffect } from 'react'
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  format, isWithinInterval, parseISO
} from 'date-fns'

import WaterTank from '../components/WaterTank'
import StatsCard from '../components/StatsCard'
import MobileNav from '../components/MobileNav'
import SettingsOverlay from '../components/SettingsOverlay'
import Sidebar from '../components/Sidebar'

function Dashboard() {
  const [tankData, setTankData] = useState({
    currentLevel: 0,
    temperature: 24
  })

  const [settings, setSettings] = useState({
    thresholdType: 'percentage',
    thresholdValue: 20,
    tankShape: 'rectangular',
    dimensions: {
      length: 16.5,
      width: 12,
      height: 15,
      diameter: 12
    },
    notificationsEnabled: true
  })

  const [showSettings, setShowSettings] = useState(false)
  const [usage, setUsage] = useState({ daily: 0, weekly: 0, monthly: 0 })

  // Fetch settings from server on load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/tank-settings')
        const data = await res.json()
        setSettings({
          thresholdType: data.thresholdType || 'percentage',
          thresholdValue: data.thresholdValue || 20,
          tankShape: data.tankShape || 'rectangular',
          dimensions: {
            length: data.length || 0,
            width: data.width || 0,
            height: data.height || 0,
            diameter: data.diameter || 0
          },
          notificationsEnabled: data.notificationsEnabled ?? true
        })
      } catch (err) {
        console.error('Failed to fetch settings:', err)
      }
    }

    fetchSettings()
  }, [])

  const computeMaxCapacity = () => {
    const { height, width, length, diameter } = settings.dimensions
    if (settings.tankShape === 'rectangular') {
      return (height * width * length) / 1000 // cm³ to L
    } else {
      const radius = diameter / 2
      return (Math.PI * radius * radius * height) / 1000 // cm³ to L
    }
  }

  const maxCapacity = Math.round(computeMaxCapacity())

  // Fetch sensor data periodically
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const res = await fetch('/api/sensor-data')
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const { temperature, distance_cm } = data[0]
          const filledHeight = Math.max(0, settings.dimensions.height - distance_cm)

          let volumeCm3 = 0
          if (settings.tankShape === 'rectangular') {
            const { width, length } = settings.dimensions
            volumeCm3 = filledHeight * width * length
          } else {
            const r = settings.dimensions.diameter / 2
            volumeCm3 = Math.PI * r * r * filledHeight
          }

          const volumeL = volumeCm3 / 1000

          setTankData({
            temperature: parseFloat(temperature).toFixed(1),
            currentLevel: parseFloat(volumeL.toFixed(2))
          })
        }
      } catch (err) {
        console.error('Sensor error:', err)
      }
    }

    fetchSensorData()
    const interval = setInterval(fetchSensorData, 2000)
    return () => clearInterval(interval)
  }, [settings])

  // Fetch usage logs
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch('/api/logs')
        const data = await res.json()

        const now = new Date()
        const todayStr = format(now, 'yyyy-MM-dd')
        const weekStart = startOfWeek(now, { weekStartsOn: 1 })
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
        const monthStart = startOfMonth(now)
        const monthEnd = endOfMonth(now)

        let daily = 0, weekly = 0, monthly = 0

        data.forEach(log => {
          if (log.activityType !== 'Usage') return

          const usageAmount = Number(log.amount || 0)
          const logDateStr = format(parseISO(log.date), 'yyyy-MM-dd')

          if (logDateStr === todayStr) daily += usageAmount
          if (isWithinInterval(parseISO(log.date), { start: weekStart, end: weekEnd })) weekly += usageAmount
          if (isWithinInterval(parseISO(log.date), { start: monthStart, end: monthEnd })) monthly += usageAmount
        })

        setUsage({ daily, weekly, monthly })
      } catch (err) {
        console.error('Usage fetch error:', err)
      }
    }

    fetchUsage()
  }, [])

  const levelPercent = (tankData.currentLevel / maxCapacity) * 100
  const isBelowThreshold = settings.thresholdType === 'percentage'
    ? levelPercent < settings.thresholdValue
    : tankData.currentLevel < settings.thresholdValue

  useEffect(() => {
  let audio

  if (isBelowThreshold) {
    audio = new Audio('/src/audio/alert.wav')
    audio.loop = true
    audio.play().catch(err => console.warn('Autoplay blocked or error:', err))
  }

  return () => {
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
  }
}, [isBelowThreshold])


  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-100 to-blue-300">
      <Sidebar />
      <div className="flex-auto mx-auto max-w-7xl p-4 md:p-6 overflow-auto">
        <MobileNav />

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Water Level</h2>
          <button
            className="p-2 rounded-full hover:bg-blue-100"
            onClick={() => setShowSettings(true)}
          >
            Settings
          </button>
        </div>

        {isBelowThreshold && (
            <div
              className="mb-4 p-4 rounded-lg text-white text-lg font-bold border-2 border-red-800 shadow-lg flex items-center gap-3 animate-flash-bg"
            >
              Alert: Water level is below your configured threshold.
            </div>
          )}

      


        <WaterTank
          capacity={maxCapacity}
          currentLevel={tankData.currentLevel}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <StatsCard title="Max Capacity" value={maxCapacity} unit="L" />
          <StatsCard title="Current Level" value={tankData.currentLevel} unit="L" />
          <StatsCard title="Temperature" value={tankData.temperature} unit="°C" />
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Usage</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-lg font-medium">Daily</h4>
              <p className="text-2xl font-bold">{usage.daily} L</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-lg font-medium">Weekly</h4>
              <p className="text-2xl font-bold">{usage.weekly} L</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h4 className="text-lg font-medium">Monthly</h4>
              <p className="text-2xl font-bold">{usage.monthly} L</p>
            </div>
          </div>
        </div>

        <SettingsOverlay
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          initialSettings={settings}
          onSave={async (newSettings) => {
            try {
              await fetch('/api/tank-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
              })
              setSettings(newSettings)
            } catch (err) {
              console.error('Failed to save settings:', err)
            }
          }}
        />
      </div>
    </div>
  )
}

export default Dashboard
