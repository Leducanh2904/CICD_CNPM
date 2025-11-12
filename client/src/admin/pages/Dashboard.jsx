import React, { useEffect, useState } from 'react';
import { getAdminStats, getStores } from '../api/adminApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

function Dashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0, totalStores: 0, revenueStats: [] });
  const [stores, setStores] = useState([]);
  const [selectedTime, setSelectedTime] = useState('all');
  const [selectedStore, setSelectedStore] = useState('all');
  const [loading, setLoading] = useState(false);

  const getDateParams = () => {
    if (selectedTime === 'all') return { fromDate: null, toDate: null };
    const now = new Date();
    let fromMonth = now.getMonth();
    let fromYear = now.getFullYear();
    switch (selectedTime) {
      case '3m':
        fromMonth -= 2;
        break;
      case '6m':
        fromMonth -= 5;
        break;
      case '12m':
        fromMonth -= 11;
        break;
    }
    if (fromMonth < 0) {
      fromMonth += 12;
      fromYear--;
    }
    const fromDate = new Date(fromYear, fromMonth, 1).toISOString().slice(0, 10);
    const toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    console.log('🔍 Date params:', { fromDate, toDate });
    return { fromDate, toDate };
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { fromDate, toDate } = getDateParams();
      const params = new URLSearchParams();
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);
      if (selectedStore !== 'all') {
        const storeIdStr = selectedStore.toString();
        params.append('store_id', storeIdStr);
        console.log('🔍 Sending store_id param:', storeIdStr);
      }
      const queryString = params.toString() ? `?${params.toString()}` : '';
      console.log('🔍 Full query for stats:', `/order/admin/stats${queryString}`);  // ✅ FIX: /order số ít
      const data = await getAdminStats(queryString);
      console.log('🔍 Revenue stats response:', data.revenueStats.length, 'items:', data.revenueStats.map(r => ({month: r.month, revenue: r.revenue})));  // Debug full data
      setStats(data);
    } catch (error) {
      console.error('Failed to load admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const data = await getStores();
      const storeList = [{ id: 'all', name: 'All Stores' }, ... (data.data || data || [])];
      setStores(storeList);
      console.log('🔍 Loaded stores:', storeList.map(s => ({id: s.id, name: s.name})));
    } catch (error) {
      console.error('Failed to load stores:', error);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [selectedTime, selectedStore]);

  const exportCSV = () => {
  // Đảm bảo revenue là số khi tính tổng
  const Total = stats.revenueStats.reduce((sum, stat) => sum + Number(stat.revenue), 0);
  
  const csvData = [
    // Dữ liệu từng tháng
    ...stats.revenueStats.map(stat => ({
      Month: stat.month,
      Revenue: Number(stat.revenue), // Đảm bảo là số
      Total_Revenue: ""  // Để trống cho các dòng tháng
    })),
    // Dòng tổng cuối cùng
    {
      Month: "TOTAL",
      Revenue: Total,
      Total_Revenue: Total
    }
  ];
  
  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `revenue_${selectedTime}_${selectedStore === 'all' ? 'all' : selectedStore}.csv`;
  link.click();
};

  // ✅ FIX: Loose == for find
  const selectedStoreObj = stores.find(s => s.id == selectedStore);
  const selectedStoreName = selectedStoreObj ? selectedStoreObj.name : 'All Stores';

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="text-3xl">{stats.totalUsers}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-semibold">Total Orders</h3>
          <p className="text-3xl">{stats.totalOrders}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-semibold">Total Stores</h3>
          <p className="text-3xl">{stats.totalStores}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Time Filter</label>
            <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} className="w-full p-2 border rounded">
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="12m">Last 12 Months</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Store Filter</label>
            <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} className="w-full p-2 border rounded">
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={exportCSV} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-2">Revenue by Month (Store: {selectedStoreName})</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.revenueStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
            <Legend />
            <Bar dataKey="revenue" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default Dashboard;