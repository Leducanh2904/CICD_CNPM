import React, { useEffect, useState } from 'react';
import { getSellerStats } from '../api/sellerApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SellerDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, revenueStats: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getSellerStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load seller stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-semibold">Total Delivered Orders</h3>
          <p className="text-3xl">{stats.totalOrders}</p>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">Revenue by Month (Your Store)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={stats.revenueStats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="revenue" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}