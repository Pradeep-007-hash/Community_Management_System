import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { getAdminStats } from '../api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminViewDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getAdminStats();
        setStats(response.data);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const data = [
    { name: 'Men', value: stats.men, color: '#0088FE' },
    { name: 'Women', value: stats.women, color: '#00C49F' },
    { name: 'Children', value: stats.children, color: '#FFBB28' },
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <div style={{color:'black'}}>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Comprehensive overview of community demographics and housing statistics</p>
            </div>
            <div className="text-right"style={{color:'black'}}>
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-lg font-semibold text-gray-900">{new Date(stats.timestamp).toLocaleString()}</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800"style={{color:'black'}}>Detailed Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"style={{color:'black'}}>
            <div className="bg-blue-100 p-4 rounded-lg text-center"style={{color:"black"}}>
              <h3 className="text-lg font-semibold text-blue-800">Men</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.men}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-green-800">Women</h3>
              <p className="text-2xl font-bold text-green-600">{stats.women}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-yellow-800">Children</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.children}</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-purple-800">Occupied Houses</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.occupied}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-gray-800">Empty Houses</h3>
              <p className="text-2xl font-bold text-gray-600">{stats.empty}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"style={{color:'black'}}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Total Members</h3>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm opacity-90 mt-2">Active community members</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Occupied Houses</h3>
              <p className="text-3xl font-bold">{stats.occupied}</p>
              <p className="text-sm opacity-90 mt-2">Houses with residents</p>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Empty Houses</h3>
              <p className="text-3xl font-bold">{stats.empty}</p>
              <p className="text-sm opacity-90 mt-2">Available housing units</p>
            </div>
          </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-center">House Occupancy Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[{ name: 'Houses', occupied: stats.occupied, empty: stats.empty }]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="occupied" fill="#8884d8" name="Occupied Houses" />
            <Bar dataKey="empty" fill="#82ca9d" name="Empty Houses" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-center">Population Distribution</h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
        </div>
      </div>
    </div>
  );
};

export default AdminViewDashboard;
