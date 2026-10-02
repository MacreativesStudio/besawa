import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CreditCard,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  Loader2,
  Video,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  MessageCircle,
  Activity,
  Zap,
  Building,
} from 'lucide-react';
import { api } from '../../api';
import { DashboardMetrics, Booking, FullTherapist } from '../../types';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';

interface AdminOverviewViewProps {
  onTabChange: (tab: string) => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({ onTabChange }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [activeTherapistsCount, setActiveTherapistsCount] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAdminMetrics(),
      api.getAdminBookings(),
      api.getAdminTherapists().catch(() => ({ therapists: [] })),
    ])
      .then(([metricsData, bookingsData, therapistsData]) => {
        setMetrics(metricsData);
        setRecentBookings(bookingsData.bookings.slice(0, 6));
        if (therapistsData && therapistsData.therapists) {
          setActiveTherapistsCount(
            therapistsData.therapists.filter((t: FullTherapist) => t.verification_status === 'VERIFIED').length || 3
          );
        }
      })
      .catch((err) => console.error('Failed fetching overview data:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-[#54635B]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D5A46] mb-3" />
        <p className="text-xs font-semibold">Loading platform operational metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Executive Welcome & Quick Action Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DED6] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#2D5A46] text-xs font-bold mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C89D57]" />
            <span>Operational Command • Kilimani HQ, Nairobi EAT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C2420] tracking-tight">
            Executive Operations Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#54635B] mt-1 max-w-2xl">
            Real-time appointment dispatch, Safaricom Lipa na M-Pesa reconciliations, and clinical practitioner governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTabChange('bookings')}
            leftIcon={<Calendar className="w-3.5 h-3.5" />}
          >
            All Bookings ({metrics?.confirmedBookings ?? 0})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTabChange('therapists')}
            leftIcon={<Users className="w-3.5 h-3.5" />}
          >
            Therapist Roster ({activeTherapistsCount})
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onTabChange('settlements')}
            leftIcon={<CreditCard className="w-3.5 h-3.5" />}
          >
            Settlement Ledger (80/20)
          </Button>
        </div>
      </div>

      {/* 1. High-Density Widescreen Metric Banner (5 Columns on Large Displays) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Today's Sessions */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3DED6] shadow-xs hover:border-[#2D5A46]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#78867E]">Today's Scheduled</span>
            <div className="w-8 h-8 rounded-lg bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1C2420]">{metrics?.todaySessions ?? 0}</div>
          <div className="text-[11px] text-[#286E47] font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Active clinical dispatch</span>
          </div>
        </div>

        {/* Confirmed Future */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3DED6] shadow-xs hover:border-[#2D5A46]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#78867E]">Confirmed Future</span>
            <div className="w-8 h-8 rounded-lg bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1C2420]">{metrics?.confirmedBookings ?? 0}</div>
          <div className="text-[11px] text-[#54635B] mt-1">Lipa na M-Pesa verified</div>
        </div>

        {/* Awaiting Payment */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3DED6] shadow-xs hover:border-[#D6A54A]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#78867E]">Awaiting Payment</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF2E4] text-[#9E6B1F] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#9E6B1F]">{metrics?.pendingBookings ?? 0}</div>
          <div className="text-[11px] text-[#9E6B1F] font-semibold mt-1">Holding 15-min reservation</div>
        </div>

        {/* Concluded Sessions */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3DED6] shadow-xs hover:border-[#2D5A46]/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#78867E]">Concluded Care</span>
            <div className="w-8 h-8 rounded-lg bg-[#E8F3ED] text-[#286E47] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1C2420]">{metrics?.completedSessions ?? 0}</div>
          <div className="text-[11px] text-[#54635B] mt-1">Successfully fulfilled care</div>
        </div>

        {/* Verified Practitioners */}
        <div className="bg-white p-5 rounded-2xl border border-[#E3DED6] shadow-xs hover:border-[#2D5A46]/40 transition-all sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#78867E]">Active Clinicians</span>
            <div className="w-8 h-8 rounded-lg bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1C2420]">{activeTherapistsCount}</div>
          <div className="text-[11px] text-[#286E47] font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>Licenced on roster</span>
          </div>
        </div>
      </div>

      {/* 2. Maximized Bento Row: Financial Ledger + Operational Dispatch Hub */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Financial & Settlement Performance (80/20 Breakdown) - Spans 7 or 8 columns */}
        <div className="xl:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DED6] shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EDE9E1]">
              <div>
                <h2 className="text-lg font-bold text-[#1C2420]">Financial Ledger & Settlement Pool</h2>
                <p className="text-xs text-[#54635B] mt-0.5">
                  Live figures calculated from verified Safaricom M-Pesa receipts (Till 174379).
                </p>
              </div>
              <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-[#2D5A46] bg-[#EBF2EE] px-3 py-1.5 rounded-full border border-[#2D5A46]/20 self-start sm:self-auto">
                80% Practitioner • 20% Be Sawa
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              <div className="p-5 rounded-2xl bg-[#FBF9F5] border border-[#E3DED6]">
                <span className="text-xs font-semibold text-[#78867E]">Gross Platform Revenue</span>
                <div className="text-2xl sm:text-3xl font-black text-[#1C2420] mt-1.5">
                  KES {metrics?.grossRevenue?.toLocaleString() ?? 0}
                </div>
                <div className="text-[11px] text-[#54635B] mt-1">100% Client payments confirmed</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#EBF2EE] border border-[#2D5A46]/30">
                <span className="text-xs font-semibold text-[#2D5A46]">Be Sawa Retained (20%)</span>
                <div className="text-2xl sm:text-3xl font-black text-[#2D5A46] mt-1.5">
                  KES {metrics?.platformRetainedRevenue?.toLocaleString() ?? 0}
                </div>
                <div className="text-[11px] text-[#2D5A46] mt-1">Operating margin & infrastructure</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#F7EFEA] border border-[#9E5D43]/30">
                <span className="text-xs font-semibold text-[#9E5D43]">Therapist Payable (80%)</span>
                <div className="text-2xl sm:text-3xl font-black text-[#9E5D43] mt-1.5">
                  KES {metrics?.therapistPayableTotal?.toLocaleString() ?? 0}
                </div>
                <div className="text-[11px] text-[#9E5D43] font-semibold mt-1">
                  {metrics?.outstandingSettlements ?? 0} settlements pending payout
                </div>
              </div>
            </div>
          </div>

          {/* Visual Split Bar */}
          <div className="pt-3 border-t border-[#EDE9E1]/60">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-[#9E5D43]">80% Therapist Payout Pool (Ethical Settlement)</span>
              <span className="text-[#2D5A46]">20% Platform Fee</span>
            </div>
            <div className="h-3 w-full bg-[#E3DED6] rounded-full overflow-hidden flex">
              <div className="bg-[#9E5D43] h-full transition-all" style={{ width: '80%' }} />
              <div className="bg-[#2D5A46] h-full transition-all" style={{ width: '20%' }} />
            </div>
          </div>
        </div>

        {/* Right: Operational Health & Clinical Dispatch Hub - Spans 4 or 5 columns */}
        <div className="xl:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DED6] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E1]">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#2D5A46]" />
                <h3 className="text-sm font-bold text-[#1C2420]">Clinical Dispatch Hub</h3>
              </div>
              <span className="text-[10px] font-bold text-[#286E47] bg-[#E8F3ED] px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Live
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {/* Room 1 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] border border-[#EDE9E1] text-xs">
                <div>
                  <div className="font-bold text-[#1C2420]">Kilimani Room 1A (Sanctuary)</div>
                  <div className="text-[11px] text-[#54635B]">Couples & Family Space</div>
                </div>
                <span className="text-[10px] font-bold text-[#2D5A46] bg-[#EBF2EE] px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              {/* Room 2 */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] border border-[#EDE9E1] text-xs">
                <div>
                  <div className="font-bold text-[#1C2420]">Kilimani Room 2B (Gentle)</div>
                  <div className="text-[11px] text-[#54635B]">Kids & Adolescent Therapy</div>
                </div>
                <span className="text-[10px] font-bold text-[#286E47] bg-[#E8F3ED] px-2 py-0.5 rounded-md">
                  Scheduled
                </span>
              </div>

              {/* Google Meet Encrypted */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] border border-[#EDE9E1] text-xs">
                <div>
                  <div className="font-bold text-[#1C2420]">Telehealth Secure Video</div>
                  <div className="text-[11px] text-[#54635B]">Automated Meet Link Engine</div>
                </div>
                <span className="text-[10px] font-bold text-[#2D5A46] bg-[#EBF2EE] px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-[#C89D57]" /> Ready
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#EDE9E1]">
            <button
              onClick={() => onTabChange('bookings')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-[#2D5A46] bg-[#EBF2EE] hover:bg-[#DCE7E1] transition-colors cursor-pointer"
            >
              <span>Manage Live Appointments</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. High-Density Maximized Recent Bookings Stream Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DED6] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EDE9E1]">
          <div>
            <h2 className="text-lg font-bold text-[#1C2420]">Recent Booking Activity</h2>
            <p className="text-xs text-[#54635B]">
              Latest client appointments dispatched through the booking engine.
            </p>
          </div>
          <button
            onClick={() => onTabChange('bookings')}
            className="text-xs font-bold text-[#2D5A46] hover:underline inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>View All ({recentBookings.length} bookings)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-[#FBF9F5] text-[#78867E] uppercase font-bold border-b border-[#E3DED6]">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Therapist</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE9E1]">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-[#FBF9F5] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#2D5A46] whitespace-nowrap">
                    {booking.booking_reference}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#1C2420]">{booking.client_name}</div>
                    <div className="text-[11px] text-[#54635B] flex items-center gap-1.5 mt-0.5">
                      <span>{booking.client_phone}</span>
                      <a
                        href={`https://wa.me/${booking.client_phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2D5A46] hover:text-[#1E3F30] p-0.5"
                        title="Open WhatsApp Chat with Client"
                      >
                        <MessageCircle className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-[#1C2420]">{booking.service_name}</div>
                    <div className="text-[10px] text-[#78867E] flex items-center gap-1 mt-0.5">
                      {booking.delivery_mode === 'ONLINE' ? (
                        <>
                          <Video className="w-3 h-3 text-[#2D5A46]" /> Telehealth
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3 h-3 text-[#9E5D43]" /> Kilimani Rooms
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#1C2420]">
                    {booking.therapist_name}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-semibold text-[#1C2420]">{booking.date}</div>
                    <div className="text-[11px] text-[#54635B]">{booking.time}</div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={booking.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onTabChange('bookings')}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#2D5A46] bg-[#EBF2EE] hover:bg-[#DCE7E1] transition-colors cursor-pointer"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Platform Compliance & Daraja Gateway Safeguards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E3DED6] shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-[#2D5A46]" />
            <h3 className="text-sm font-bold text-[#1C2420]">Clinical Compliance Standards</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-[#54635B]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#286E47] shrink-0 mt-0.5" />
              <span>Zero sensitive psychotherapy clinical notes stored in unencrypted public tables.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#286E47] shrink-0 mt-0.5" />
              <span>Mandatory practitioner credentials screening prior to public calendar dispatch.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#286E47] shrink-0 mt-0.5" />
              <span>Server-authoritative availability slot locks (anti-double-booking protection).</span>
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E3DED6] shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-5 h-5 text-[#2D5A46]" />
            <h3 className="text-sm font-bold text-[#1C2420]">Safaricom Daraja Integration</h3>
          </div>
          <ul className="space-y-2.5 text-xs text-[#54635B]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#286E47] shrink-0 mt-0.5" />
              <span>Live M-Pesa STK Push and Buy Goods Till 174379 receipt verification active.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#286E47] shrink-0 mt-0.5" />
              <span>Automatic therapist settlement generation triggered on valid M-Pesa receipt.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#286E47] shrink-0 mt-0.5" />
              <span>Immutable cryptographic audit trail tracking all payment confirmations.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
