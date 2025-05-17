import { useState } from 'react'

function SettingsOverlay({ isOpen, onClose, initialSettings }) {
  const [settings, setSettings] = useState(initialSettings)

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleRadioChange = (e) => {
    setSettings(prev => ({
      ...prev,
      thresholdType: e.target.value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Threshold Alerts */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Threshold Alerts</h3>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">Alert me when water level is below:</p>
              <div className="flex items-center space-x-6 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="percentage"
                    checked={settings.thresholdType === 'percentage'}
                    onChange={handleRadioChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Percentage</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="liters"
                    checked={settings.thresholdType === 'liters'}
                    onChange={handleRadioChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Liters</span>
                </label>
              </div>
              <div className="w-full max-w-xs">
                <input
                  type="range"
                  min={settings.thresholdType === 'percentage' ? 5 : 25}
                  max={settings.thresholdType === 'percentage' ? 50 : 250}
                  step={settings.thresholdType === 'percentage' ? 5 : 25}
                  value={settings.thresholdValue}
                  name="thresholdValue"
                  onChange={handleSettingChange}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-600">
                    {settings.thresholdType === 'percentage' ? '5%' : '25L'}
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {settings.thresholdValue}{settings.thresholdType === 'percentage' ? '%' : 'L'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {settings.thresholdType === 'percentage' ? '50%' : '250L'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tank Configuration */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Tank Configuration</h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Tank Capacity (Liters)</label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  max="1000"
                  step="50"
                  name="tankCapacity"
                  value={settings.tankCapacity}
                  onChange={handleSettingChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500">L</span>
                </div>
              </div>
            </div>
          </div>
          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md"
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