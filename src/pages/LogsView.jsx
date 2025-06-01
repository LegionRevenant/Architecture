// src/pages/LogsView.jsx

import { useState, useEffect } from 'react';
import {
  firestore,
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  getDoc,
  addDoc,
  increment,
  Timestamp,
} from '../firebase';
import { format, parseISO, isSameDay, startOfWeek } from 'date-fns';
import WaterChart from '../components/WaterChart';
import MobileNav from '../components/MobileNav';
import Sidebar from '../components/Sidebar';

function LogsView() {
  const [syncData, setSyncData] = useState({
    lastLog: '—',
    serverSync: 'Disconnected',
  });
  const [logs, setLogs] = useState([]);
  const [dailyUsage, setDailyUsage] = useState(new Array(7).fill(0));
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ activityType: 'Usage', amount: '' });
  const [filters, setFilters] = useState({ activityType: 'All', date: '' });

  useEffect(() => {
    fetchLogs();
  }, []);

  // Fetch daily usage for the week and logs
  const fetchLogs = async () => {
    setLoading(true);

    try {
      // Calculate Monday of current week (week starts on Monday)
      const today = new Date();
      const monday = startOfWeek(today, { weekStartsOn: 1 });
      monday.setHours(0, 0, 0, 0);

      // Prepare empty array for 7 days (Mon-Sun)
      const usageArr = new Array(7).fill(0);

      // Fetch daily usage docs from Firestore 'daily_usage'
      const dailyUsageCol = collection(firestore, 'daily_usage');
      const dailyUsageSnapshot = await getDocs(dailyUsageCol);

      dailyUsageSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.date) {
          const docDate = new Date(data.date);
          docDate.setHours(0, 0, 0, 0);
          const diffDays = Math.floor((docDate - monday) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays < 7) {
            usageArr[diffDays] = data.totalUsage || 0;
          }
        }
      });

      setDailyUsage(usageArr);

      // Fetch all logs sorted descending by date for the table
      const logsCol = collection(firestore, 'logs');
      const q = query(logsCol, orderBy('date', 'desc'));
      const logsSnapshot = await getDocs(q);
      const logsData = logsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setLogs(logsData);

      // Update sync info
      const latestLog = logsData[0];
      const lastLogTime = latestLog?.date?.toDate
        ? format(latestLog.date.toDate(), 'MMM dd, yyyy HH:mm')
        : '—';

      setSyncData({
        lastLog: lastLogTime,
        serverSync: 'Connected',
      });
    } catch (err) {
      setSyncData({ lastLog: '—', serverSync: 'Disconnected' });
      alert('Error fetching logs: ' + err.message);
    }

    setLoading(false);
  };

  // Handle form input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle filter input changes
  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle adding new log
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      alert('Please enter a valid amount greater than zero.');
      return;
    }

    const amount = Number(formData.amount);
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    const logData = {
      activityType: formData.activityType,
      amount,
      date: Timestamp.now(),
    };

    try {
      // Add to logs collection
      await addDoc(collection(firestore, 'logs'), logData);

      // If Usage, update daily_usage collection
      if (formData.activityType === 'Usage') {
        const usageDocRef = doc(firestore, 'daily_usage', todayKey);
        const usageDoc = await getDoc(usageDocRef);

        if (usageDoc.exists()) {
          // Increment existing totalUsage
          await setDoc(
            usageDocRef,
            {
              totalUsage: increment(amount),
              date: todayKey,
            },
            { merge: true }
          );
        } else {
          // Create new daily usage doc
          await setDoc(usageDocRef, {
            totalUsage: amount,
            date: todayKey,
          });
        }
      }

      alert('Log added successfully!');
      setFormData({ activityType: 'Usage', amount: '' });
      fetchLogs();
    } catch (err) {
      alert('Failed to add log: ' + err.message);
    }
  };

  // Filter logs by activity type and date
  const filteredLogs = logs.filter(log => {
    const matchesActivity =
      filters.activityType === 'All' || log.activityType === filters.activityType;
    const matchesDate =
      !filters.date ||
      isSameDay(
        log.date?.toDate ? log.date.toDate() : new Date(log.date),
        parseISO(filters.date)
      );
    return matchesActivity && matchesDate;
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-blue-100 to-blue-300">
      <Sidebar />

      <div className="mx-auto max-w-full p-4 md:p-6 overflow-auto flex-1">
        <MobileNav />

        {/* Weekly Usage Chart */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Weekly Water Usage</h2>
          <WaterChart dailyUsages={dailyUsage} />
        </div>

        {/* Sync Info */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 uppercase mb-4">SYNC INFO</h3>
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-600 mb-2">Last log received:</h4>
                <p className="text-lg font-semibold">{syncData.lastLog}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-600 mb-2">Server Sync:</h4>
                <p className="text-lg font-semibold flex items-center">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      syncData.serverSync === 'Connected' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></span>
                  {syncData.serverSync}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Log Entry Form */}
        <div className="mt-8 bg-white p-6 rounded shadow-md max-w-full">
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
                step="any"
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

        {/* Filters */}
        <div className="mt-8 bg-white p-6 rounded shadow-md">
          <h3 className="text-xl font-semibold mb-4">Filter Logs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              Activity Type:
              <select
                name="activityType"
                value={filters.activityType}
                onChange={handleFilterChange}
                className="mt-1 p-2 border rounded w-full"
              >
                <option value="All">All</option>
                <option value="Usage">Usage</option>
                <option value="Refill">Refill</option>
              </select>
            </label>

            <label className="block">
              Date:
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="mt-1 p-2 border rounded w-full"
              />
            </label>
          </div>
        </div>

        {/* Logs Table */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Activity Log</h3>
          <div className="bg-white rounded-lg shadow-md overflow-auto max-h-[400px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (L)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-10">
                      Loading...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-10">
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{log.activityType}</td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap font-semibold ${
                          log.activityType === 'Refill' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {log.activityType === 'Refill' ? '+' : '-'}
                        {log.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.date?.toDate
                          ? format(log.date.toDate(), 'MMM dd, yyyy HH:mm')
                          : '—'}
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
  );
}

export default LogsView;
