import { useEffect, useRef } from 'react'

function WaterTank({ capacity, currentLevel, onLevelChange }) {
  const tankRef = useRef(null)
  const levelPercentage = (currentLevel / capacity) * 100

  // Handle level change with tank click
  const handleTankClick = (e) => {
    if (!tankRef.current) return
    
    const rect = tankRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height
    
    // Calculate level based on click position (inverted because tank fills from bottom)
    const clickPercent = 100 - ((y / height) * 100)
    const newLevel = Math.round((clickPercent / 100) * capacity)
    
    // Ensure level is within bounds
    const boundedLevel = Math.max(0, Math.min(capacity, newLevel))
    onLevelChange(boundedLevel)
  }

  return (
    <div 
      ref={tankRef}
      className="water-tank cursor-pointer relative mb-4"
      onClick={handleTankClick}
    >
      {/* Water level */}
      <div 
        className="water-level"
        style={{ height: `${levelPercentage}%` }}
      >
        <div className="water-ripple"></div>
      </div>
      
      {/* Level markings */}
      <div className="absolute top-0 left-0 h-full w-16 flex flex-col justify-between p-2 text-xs font-medium">
        {[500, 450, 400, 350, 300, 250, 200, 150, 100, 50, 0].map((level) => (
          <div key={level} className="flex items-center">
            <span className="mr-1">{level} L</span>
            <div className="flex-1 border-t border-dashed border-blue-400" style={{ width: '100%' }}></div>
          </div>
        ))}
      </div>
      
      {/* Current level indicator */}
      {currentLevel > 0 && (
        <div 
          className="absolute right-4 bg-white px-2 py-1 rounded-md text-blue-600 font-bold shadow-sm"
          style={{ bottom: `${levelPercentage}%`, transform: 'translateY(50%)' }}
        >
          {currentLevel}L
        </div>
      )}
    </div>
  )
}

export default WaterTank