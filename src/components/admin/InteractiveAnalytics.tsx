import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  CreditCard,
  Users,
  Video,
  MapPin,
  Calendar,
  Activity,
  Sparkles,
  Loader2,
  PieChart,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../api';
import { AnalyticsData } from '../../types';

export const InteractiveAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api
      .getAdminAnalytics()
      .then((res) => setData(res))
      .catch((err) => console.error('Failed fetching analytics:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const maxRevenue = useMemo(() => {
    if (!data || data.dailyRevenueTrend.length === 0) return 10000;
    const max = Math.max(...data.dailyRevenueTrend.map((p) => p.revenue));
    return max > 0 ? max : 10000;
  }, [data]);

  const peakDay = useMemo(() => {
    if (!data || data.dailyRevenueTrend.length === 0) return null;
    return [...data.dailyRevenueTrend].sort((a, b) => b.revenue - a.revenue)[0];
  }, [data]);

  const totalPeriodRevenue = useMemo(() => {
    if (!data) return 0;
    return data.dailyRevenueTrend.reduce((sum, p) => sum + p.revenue, 0);
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-[#E3DED6] shadow-xs flex flex-col items-center justify-center text-[#54635B] min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D5A46] mb-3" />
        <p className="text-xs font-semibold">Computing executive telemetry and clinical metrics...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* 1. Header with Period Summary */}
      <div className="bg-white rounded-3xl p-6 border border-[#E3DED6] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D5A46]" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#2D5A46]">
              Executive Telemetry & Practice Analytics
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1C2420] tracking-tight">
            Clinical Volume & Revenue Trajectories
          </h2>
          <p className="text-xs text-[#54635B] mt-0.5">
            14-day rolling performance across M-Pesa collections, category distribution, and clinical utilization.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="bg-[#EBF2EE] px-4 py-2 rounded-2xl border border-[#2D5A46]/20 text-right">
            <div className="text-[10px] text-[#2D5A46] uppercase font-bold">14-Day Session Yield</div>
            <div className="text-base font-black text-[#2D5A46]">
              KES {totalPeriodRevenue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary 14-Day Revenue & Appointments Chart */}
      <div className="bg-white rounded-3xl p-6 border border-[#E3DED6] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#1C2420] flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#2D5A46]" />
              <span>14-Day Revenue & Appointment Dispatch Volume</span>
            </h3>
            <p className="text-[11px] text-[#54635B]">
              Hover over any daily bar to inspect gross session receipts and confirmed appointments.
            </p>
          </div>

          {peakDay && peakDay.revenue > 0 && (
            <div className="text-[11px] font-semibold text-[#2D5A46] bg-[#EBF2EE] px-3 py-1 rounded-full self-start">
              Peak Day: <strong>{peakDay.label}</strong> (KES {peakDay.revenue.toLocaleString()})
            </div>
          )}
        </div>

        {/* Visual Bar Graph */}
        <div className="pt-6 pb-2">
          <div className="h-48 flex items-end justify-between gap-1.5 sm:gap-3 px-2 border-b border-[#EDE9E1]">
            {data.dailyRevenueTrend.map((point, index) => {
              const heightPercent = Math.max(8, Math.round((point.revenue / maxRevenue) * 100));
              const isHovered = hoveredPoint === index;
              const hasActivity = point.revenue > 0 || point.bookingsCount > 0;

              return (
                <div
                  key={point.date}
                  className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(index)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-14 z-20 bg-[#1C2420] text-white p-2 rounded-xl text-center shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95">
                      <div className="text-[10px] text-[#A2B3A8] font-semibold">{point.date}</div>
                      <div className="text-xs font-black">KES {point.revenue.toLocaleString()}</div>
                      <div className="text-[10px] text-[#EBF2EE]">{point.bookingsCount} Session{point.bookingsCount === 1 ? '' : 's'}</div>
                    </div>
                  )}

                  {/* Bar Visual */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[24px] sm:max-w-[32px] rounded-t-lg transition-all duration-300 ${
                      isHovered
                        ? 'bg-[#1E3F30] shadow-md scale-y-105'
                        : hasActivity
                        ? 'bg-[#2D5A46] hover:bg-[#244938]'
                        : 'bg-[#EDE9E1] hover:bg-[#E3DED6]'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* X-Axis Labels */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-3 px-2 pt-2 text-[10px] text-[#78867E] font-semibold">
            {data.dailyRevenueTrend.map((point) => (
              <div key={point.date} className="flex-1 text-center truncate">
                {point.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Three-Column Distribution & Utilization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* A. Service Category Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-[#E3DED6] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1C2420] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#9E5D43]" />
              <span>Service Category Demand</span>
            </h3>
            <span className="text-[10px] text-[#78867E]">By Bookings</span>
          </div>

          <div className="space-y-3 pt-1">
            {data.categoryDistribution.map((cat) => (
              <div key={cat.categoryId} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#1C2420]">{cat.name}</span>
                  <span className="font-mono text-[#54635B]">
                    {cat.count} ({cat.percentage}%) • KES {cat.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F4EFEA] overflow-hidden">
                  <div
                    style={{ width: `${Math.max(5, cat.percentage)}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-[#2D5A46] to-[#9E5D43]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* B. Therapist Clinical Utilization */}
        <div className="bg-white rounded-3xl p-6 border border-[#E3DED6] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1C2420] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2D5A46]" />
              <span>Clinical Capacity & Roster Utilization</span>
            </h3>
            <span className="text-[10px] text-[#78867E]">20 Slots/Wk</span>
          </div>

          <div className="space-y-3 pt-1">
            {data.therapistUtilization.slice(0, 5).map((t) => {
              const isHigh = t.utilizationRate >= 70;
              return (
                <div key={t.therapistId} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1C2420] truncate max-w-[150px]">{t.name}</span>
                    <span className="text-[11px] font-bold">
                      <span className={isHigh ? 'text-[#286E47]' : 'text-[#54635B]'}>
                        {t.bookedSessions}/{t.capacitySlots} booked ({t.utilizationRate}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F4EFEA] overflow-hidden">
                    <div
                      style={{ width: `${Math.max(4, t.utilizationRate)}%` }}
                      className={`h-full rounded-full ${
                        isHigh ? 'bg-[#286E47]' : 'bg-[#2D5A46]'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* C. Delivery Mode Split */}
        <div className="bg-white rounded-3xl p-6 border border-[#E3DED6] shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#1C2420] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#C89D57]" />
                <span>Delivery Format Ratio</span>
              </h3>
              <span className="text-[10px] text-[#78867E]">Session Split</span>
            </div>

            <div className="space-y-4 pt-1">
              {/* Online Progress */}
              <div className="bg-[#EBF2EE] p-3.5 rounded-2xl border border-[#2D5A46]/20">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#2D5A46] flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" />
                    Online Google Meet Telehealth
                  </span>
                  <span className="font-black text-[#2D5A46]">
                    {data.deliveryModeSplit.onlinePercent}% ({data.deliveryModeSplit.onlineCount})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white overflow-hidden">
                  <div
                    style={{ width: `${data.deliveryModeSplit.onlinePercent}%` }}
                    className="h-full bg-[#2D5A46] rounded-full"
                  />
                </div>
              </div>

              {/* In-Person Progress */}
              <div className="bg-[#F7EFEA] p-3.5 rounded-2xl border border-[#9E5D43]/20">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#9E5D43] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Kilimani Physical Sanctuary
                  </span>
                  <span className="font-black text-[#9E5D43]">
                    {data.deliveryModeSplit.inPersonPercent}% ({data.deliveryModeSplit.inPersonCount})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white overflow-hidden">
                  <div
                    style={{ width: `${data.deliveryModeSplit.inPersonPercent}%` }}
                    className="h-full bg-[#9E5D43] rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#EDE9E1] text-[11px] text-[#78867E]">
            Client preference split guides physical room capacity at the Kilimani consultation sanctuary.
          </div>
        </div>
      </div>
    </div>
  );
};
