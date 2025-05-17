import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

function WaterChart() {
  const [weeklyData, setWeeklyData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Tank Level (L)',
        data: [240, 350, 150, 70, 290, 240, 420],
        borderColor: '#3b82f6',
        backgroundColor: '#60a5fa',
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  })

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `${context.parsed.y}L`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 500,
        ticks: {
          stepSize: 50,
          callback: function(value) {
            return value + 'L';
          }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  return (
    <div className="rounded-lg bg-gray-900 p-4 h-96 w-full">
      <div className="text-gray-300 mb-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <h3 className="text-sm font-medium">### 350L</h3>
        </div>
      </div>
      <div className="h-80">
        <Line data={weeklyData} options={options} />
      </div>
    </div>
  )
}

export default WaterChart