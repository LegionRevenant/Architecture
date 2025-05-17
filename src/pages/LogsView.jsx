import { useState } from 'react'
import WaterChart from '../components/WaterChart'
import MobileNav from '../components/MobileNav'

function LogsView() {
  const [syncData, setSyncData] = useState({
    lastUpdate: '10:30 AM, Today',
    sensorStatus: 'Online',
    serverSync: 'Connected'
  })

  return (
    <div className="max-w-5xl mx-auto">
      <MobileNav />
      
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Weekly Water Level</h2>
        <WaterChart />
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 uppercase mb-4">SYNC INFO</h3>
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-600 mb-2">Last data received:</h4>
              <p className="text-lg font-semibold">{syncData.lastUpdate}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-600 mb-2">Sensor status:</h4>
              <p className="text-lg font-semibold flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${syncData.sensorStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {syncData.sensorStatus}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-600 mb-2">Server Sync:</h4>
              <p className="text-lg font-semibold flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${syncData.serverSync === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {syncData.serverSync}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Activity Log</h3>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level Change</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { time: 'Today, 10:30 AM', activity: 'Water level reading', change: '+20L' },
                { time: 'Today, 9:15 AM', activity: 'System alert cleared', change: '0L' },
                { time: 'Today, 8:00 AM', activity: 'Water usage', change: '-15L' },
                { time: 'Yesterday, 6:45 PM', activity: 'Tank refilled', change: '+150L' },
                { time: 'Yesterday, 2:30 PM', activity: 'Water usage', change: '-75L' }
              ].map((log, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.activity}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${log.change.startsWith('+') ? 'text-green-600' : log.change === '0L' ? 'text-gray-600' : 'text-red-600'}`}>
                    {log.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default LogsView