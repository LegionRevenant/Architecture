import { useState, useEffect } from 'react'
import WaterChart from '../components/WaterChart'
import MobileNav from '../components/MobileNav'
import Sidebar from '../components/Sidebar'

import { firestore, collection, addDoc, getDocs, query, orderBy } from '../firebase'

function LogsView() {
  const [syncData, setSyncData] = useState({
    lastUpdate: '10:30 AM, Today',
    sensorStatus: 'Online',
    serverSync: 'Connected'
  })

  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({ activityType: 'Usage', amount: '' })

  useEffect(() => {
    async function fetchLogs() {
      setLoading(true)
      try {
        const logsCol = collection(firestore, 'logs')
        const q = query(logsCol, orderBy('date', 'desc'))
        const snapshot = await getDocs(q)
        const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setLogs(logsData)
        setFilteredLogs(logsData)
      } catch (error) {
        alert('Failed to fetch logs: ' + error.message)
      }
      setLoading(false)
    }
    fetchLogs()
  }, [])

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase()
    const filtered = logs.filter(log =>
      log.activityType.toLowerCase().includes(lowerSearch) ||
      String(log.amount).includes(lowerSearch) ||
      (log.date?.toDate ? log.date.toDate().toLocaleString() : new Date(log.date).toLocaleString()).toLowerCase().includes(lowerSearch)
    )
    setFilteredLogs(filtered)
  }, [searchTerm, logs])

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!formData.amount) {
      alert('Please enter an amount')
      return
    }

    try {
      await addDoc(collection(firestore, 'logs'), {
        activityType: formData.activityType,
        amount: Number(formData.amount),
        date: new Date()
      })
      alert('Log added!')
      setFormData({ activityType: 'Usage', amount: '' })

      const logsCol = collection(firestore, 'logs')
      const q = query(logsCol, orderBy('date', 'desc'))
      const snapshot = await getDocs(q)
      const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setLogs(logsData)
      setFilteredLogs(logsData)
    } catch (err) {
      alert('Error adding log: ' + err.message)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <Sidebar />
      <div className="mx-auto max-w-5xl p-4 md:p-6 overflow-auto flex-1">
        <MobileNav />

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Weekly Water Level</h2>
          <WaterChart />
        </div>

        {/* Sync Info */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 uppercase mb-4">SYNC INFO</h3>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Last Update */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-600 mb-2">Last data received:</h4>
                <p className="text-lg font-semibold">{syncData.lastUpdate}</p>
              </div>
              {/* Sensor Status */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-600 mb-2">Sensor status:</h4>
                <p className="text-lg font-semibold flex items-center">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${syncData.sensorStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {syncData.sensorStatus}
                </p>
              </div>
              {/* Server Sync */}
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

        {/* Add Log Form */}
        <div className="mt-8 bg-white p-6 rounded shadow-md max-w-md">
          <h3 className="text-xl font-semibold mb-4">Add Log Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              Activity Type:
              <select
                name="activityType"
                value={formData.activityType}
                onChange={handleChange}
                className="ml-2 p-2 border rounded w-full"
              >
                <option value="Usage">Usage</option>
                <option value="Refill">Refill</option>
              </select>
            </label>

            <label className="block">
              Amount (L):
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="ml-2 p-2 border rounded w-full"
                required
                min="0"
              />
            </label>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Log
            </button>
          </form>
        </div>

        {/* Logs Filter */}
        <div className="mt-8 max-w-md">
          <input
            type="text"
            placeholder="Search logs by type, date or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded mb-4"
          />
        </div>

        {/* Activity Logs Table */}
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Activity Log</h3>
          <div className="bg-white rounded-lg shadow-md overflow-hidden max-h-[400px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level Change</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="3" className="text-center py-4">Loading logs...</td></tr>
                ) : filteredLogs.length === 0 ? (
                  <tr><td colSpan="3" className="text-center py-4">No matching logs</td></tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.date?.toDate ? log.date.toDate().toLocaleString() : new Date(log.date).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{log.activityType}</td>
                      <td className={`px-6 py-4 text-sm font-medium ${
                        log.activityType === 'Refill' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(log.activityType === 'Refill' ? '+' : '-') + log.amount + 'L'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

export default LogsView
