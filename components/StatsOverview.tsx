'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Home, Baby, Heart, TrendingUp, AlertCircle } from 'lucide-react';
import apiService from '@/lib/api';
import type { DashboardStats } from '@/types';

export default function StatsOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Use mock data for demo if API fails
      setStats({
        total_families: 1250,
        total_members: 5480,
        total_male: 2760,
        total_female: 2720,
        recent_births: 23,
        recent_marriages: 12,
        pending_subscriptions: 45,
        ward_distribution: [],
      });
      setError('Using demo data - Connect to backend for live statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="spinner"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Families',
      value: stats?.total_families || 0,
      icon: Home,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Total Members',
      value: stats?.total_members || 0,
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      label: 'Male Members',
      value: stats?.total_male || 0,
      icon: Users,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
    },
    {
      label: 'Female Members',
      value: stats?.total_female || 0,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Recent Births',
      value: stats?.recent_births || 0,
      icon: Baby,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
    },
    {
      label: 'Recent Marriages',
      value: stats?.recent_marriages || 0,
      icon: Heart,
      color: 'from-rose-500 to-rose-600',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
    },
    {
      label: 'Pending Subscriptions',
      value: stats?.pending_subscriptions || 0,
      icon: TrendingUp,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
  ];

  return (
    <div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900">Demo Mode</p>
            <p className="text-sm text-blue-700 mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="card p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
