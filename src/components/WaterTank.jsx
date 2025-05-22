import { useRef } from 'react'

function WaterTank({ capacity, currentLevel, onLevelChange }) {
  const tankRef = useRef(null)
  const levelPercentage = (currentLevel / capacity) * 100

  // Handle tank click to set new water level — currently disabled
  const handleTankClick = (e) => {
    if (!tankRef.current) return

    const rect = tankRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height

    const clickPercent = 100 - ((y / height) * 100)
    const newLevel = Math.round((clickPercent / 100) * capacity)

    const boundedLevel = Math.max(0, Math.min(capacity, newLevel))
    // onLevelChange(boundedLevel) // <- Commented out to disable clicking
  }

  // Color and status logic
  let backgroundColor = '#3b82f6' // normal (blue-500)
  let status = 'Normal'
  let statusColor = 'text-blue-600'

  if (levelPercentage < 20) {
    backgroundColor = '#ef4444' // red-500
    status = 'Low'
    statusColor = 'text-red-600'
  } else if (levelPercentage > 80) {
    backgroundColor = '#22c55e' // green-500
    status = 'High'
    statusColor = 'text-green-600'
  }

  return (
    <div 
      ref={tankRef}
      className="water-tank cursor-default relative mb-4"
      onClick={handleTankClick} // Clicking is disabled by commenting out onLevelChange
    >
      {/* Water level fill */}
      <div 
        className="water-level absolute bottom-0 left-0 w-full transition-all duration-500"
        style={{ 
          height: `${levelPercentage}%`,
          backgroundColor: backgroundColor,
          borderBottomLeftRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem'
        }}
      >
        <div className="water-ripple"></div>
      </div>

      {/* Dynamic level markings */}
      <div className="absolute top-0 left-0 h-full w-16 flex flex-col justify-between p-2 text-xs font-medium">
        {Array.from({ length: 11 }, (_, i) => {
          const step = capacity / 10
          const level = Math.round(capacity - i * step)
          return (
            <div key={level} className="flex items-center">
              <span className="mr-1">{level} L</span>
              <div className="flex-1 border-t border-dashed border-blue-400" style={{ width: '100%' }}></div>
            </div>
          )
        })}
      </div>

      {/* Level + Status bubble */}
      {currentLevel > 0 && (
        <div 
          className="absolute right-4 bg-white px-2 py-1 rounded-md text-blue-600 font-bold shadow-sm flex flex-col items-end"
          style={{ bottom: `${levelPercentage}%`, transform: 'translateY(50%)' }}
        >
          <div>{currentLevel}L</div>
          <div className={`text-xs font-semibold ${statusColor}`}>{status}</div>
        </div>
      )}
    </div>
  )
}

export default WaterTank
