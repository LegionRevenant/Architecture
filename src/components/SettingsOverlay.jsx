import { useState, useEffect } from 'react'

function SettingsOverlay({ isOpen, onClose, initialSettings, onSave }) {
  const [settings, setSettings] = useState(initialSettings)

  useEffect(() => {
    setSettings(initialSettings)
  }, [initialSettings])

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }))
  }

  const handleRadioChange = (e) => {
    setSettings(prev => ({
      ...prev,
      thresholdType: e.target.value
    }))
  }

  const handleSave = () => {
    onSave(settings)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-xl w-full overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Threshold Alerts */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Threshold Alerts</h3>
            <div className="flex gap-6 mb-4">
              <label>
                <input
                  type="radio"
                  value="percentage"
                  checked={settings.thresholdType === 'percentage'}
                  onChange={handleRadioChange}
                /> Percentage
              </label>
              <label>
                <input
                  type="radio"
                  value="liters"
                  checked={settings.thresholdType === 'liters'}
                  onChange={handleRadioChange}
                /> Liters
              </label>
            </div>
            <input
              type="range"
              min={settings.thresholdType === 'percentage' ? 5 : 25}
              max={settings.thresholdType === 'percentage' ? 50 : 250}
              step={settings.thresholdType === 'percentage' ? 5 : 25}
              name="thresholdValue"
              value={settings.thresholdValue}
              onChange={handleSettingChange}
              className="w-full"
            />
            <p className="mt-2 text-blue-600 font-medium">
              Alert below: {settings.thresholdValue}{settings.thresholdType === 'percentage' ? '%' : 'L'}
            </p>
          </div>

          {/* Tank Capacity */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Tank Capacity</h3>
            <input
              type="number"
              name="tankCapacity"
              value={settings.tankCapacity}
              onChange={handleSettingChange}
              min={100}
              max={1000}
              className="w-full border px-4 py-2 rounded"
            />
          </div>

          <div className="text-right pt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsOverlay
