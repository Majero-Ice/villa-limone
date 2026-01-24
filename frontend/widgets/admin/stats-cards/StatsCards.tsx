'use client';

import { useEffect, useState } from 'react';
import { Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { DashboardStats, reservationApi } from '@/entities/reservation';
import { formatPrice } from '@/shared/lib/formatPrice';
import { useToastStore } from '@/shared/lib/toast.store';

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await reservationApi.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        useToastStore.getState().error('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-base p-6 animate-pulse">
            <div className="h-4 bg-soft-beige rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-soft-beige rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return <div className="text-warm-gray">Failed to load stats</div>;
  }

  const statCards = [
    {
      title: 'Total Reservations',
      value: stats.totalReservations,
      icon: Calendar,
      color: 'text-terracotta',
      bgColor: 'bg-terracotta/10',
    },
    {
      title: 'Pending',
      value: stats.pendingReservations,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Confirmed',
      value: stats.confirmedReservations,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-olive',
      bgColor: 'bg-olive/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.title} className="card-base p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={stat.color} size={24} />
              </div>
            </div>
            <h3 className="text-warm-gray text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-2xl font-serif font-semibold text-graphite">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
