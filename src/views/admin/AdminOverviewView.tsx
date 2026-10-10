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
import { TodayAgenda } from '../../components/admin/TodayAgenda';
import { InteractiveAnalytics } from '../../components/admin/InteractiveAnalytics';
import { ClientIntelligenceModal } from '../../components/admin/ClientIntelligenceModal';
import { WhatsAppDispatcherModal } from '../../components/admin/WhatsAppDispatcherModal';

interface AdminOverviewViewProps {
  onTabChange: (tab: string) => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({ onTabChange }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [activeTherapistsCount, setActiveTherapistsCount] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedClientForProfile, setSelectedClientForProfile] = useState<{ phone: string; name: string } | null>(null);
  const [selectedBookingForWhatsApp, setSelectedBookingForWhatsApp] = useState<Booking | null>(null);

  const fetchOverviewData = () => {
    setIsLoading(true);
    Promise.all([
      api.getAdminMetrics(),
      api.getAdminBookings(),
      api.getAdminTherapists().catch(() => ({ therapists: [] })),
    ])
      .then(([metricsData, bookingsData, therapistsData]) => {
        setMetrics(metricsData);
        setAllBookings(bookingsData.bookings);
        setRecentBookings(bookingsData.bookings.slice(0, 6));
        if (therapistsData && therapistsData.therapists) {
          setActiveTherapistsCount(
            therapistsData.therapists.filter((t: FullTherapist) => t.verification_status === 'VERIFIED').length || 3
          );
        }
      })
      .catch((err) => console.error('Failed fetching overview data:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await api.updateBookingStatus(bookingId, status);
      fetchOverviewData();
    } catch (err: any) {
      console.error('Failed updating status:', err);
    }
  };

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
            Settlement Ledger (70/30)
          </Button>
        </div>
      </div>

      {/* 1. High-Density Widescreen Metric Banner */}
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

      {/* 2. DAILY OPERATIONAL AGENDA / TODAY'S SCHEDULE */}
      <TodayAgenda
        bookings={allBookings}
        onViewClient={(phone, name) => setSelectedClientForProfile({ phone, name })}
        onDispatchWhatsApp={(booking) => setSelectedBookingForWhatsApp(booking)}
        onUpdateStatus={handleUpdateBookingStatus}
      />

      {/* 3. INTERACTIVE VISUAL TELEMETRY & ANALYTICS */}
      <InteractiveAnalytics />

      {/* 4. Financial Ledger + Clinical Dispatch Bento Row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Financial & Settlement Performance (70/30 Breakdown) */}
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
                70% Practitioner • 30% Be Sawa
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
                <span className="text-xs font-semibold text-[#2D5A46]">Be Sawa Retained (30%)</span>
                <div className="text-2xl sm:text-3xl font-black text-[#2D5A46] mt-1.5">
                  KES {metrics?.platformRetainedRevenue?.toLocaleString() ?? 0}
                </div>
                <div className="text-[11px] text-[#2D5A46] mt-1">Operating margin & infrastructure</div>
              </div>

              <div className="p-5 rounded-2xl bg-[#F7EFEA] border border-[#9E5D43]/30">
                <span className="text-xs font-semibold text-[#9E5D43]">Therapist Payable (70%)</span>
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
              <span className="text-[#9E5D43]">70% Therapist Payout Pool (Ethical Settlement)</span>
              <span className="text-[#2D5A46]">30% Platform Fee</span>
            </div>
            <div className="h-3 w-full bg-[#E3DED6] rounded-full overflow-hidden flex">
              <div className="bg-[#9E5D43] h-full transition-all" style={{ width: '70%' }} />
              <div className="bg-[#2D5A46] h-full transition-all" style={{ width: '30%' }} />
            </div>
          </div>
        </div>

        {/* Right: Operational Health & Sanctuary Dispatch Hub */}
        <div className="xl:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#E3DED6] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E1]">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#2D5A46]" />
                <h3 className="text-sm font-bold text-[#1C2420]">Sanctuary Dispatch Hub</h3>
              </div>
              <span className="text-[10px] font-bold text-[#286E47] bg-[#E8F3ED] px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Live
              </span>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] border border-[#EDE9E1] text-xs">
                <div>
                  <div className="font-bold text-[#1C2420]">Kilimani Room 1A (Sanctuary)</div>
                  <div className="text-[11px] text-[#54635B]">Couples & Family Space</div>
                </div>
                <span className="text-[10px] font-bold text-[#2D5A46] bg-[#EBF2EE] px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] border border-[#EDE9E1] text-xs">
                <div>
                  <div className="font-bold text-[#1C2420]">Kilimani Room 2B (Gentle)</div>
                  <div className="text-[11px] text-[#54635B]">Kids & Adolescent Therapy</div>
                </div>
                <span className="text-[10px] font-bold text-[#286E47] bg-[#E8F3ED] px-2 py-0.5 rounded-md">
                  Scheduled
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#FBF9F5] border border-[#EDE9E1] text-xs">
                <div>
                  <div className="font-bold text-[#1C2420]">Telehealth Secure Video</div>
                  <div className="text-[11px] text-[#54635B]">Google Meet Encrypted Link</div>
                </div>
                <span className="text-[10px] font-bold text-[#286E47] bg-[#E8F3ED] px-2 py-0.5 rounded-md">
                  Encrypted
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EDE9E1]">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => onTabChange('settings')}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Configure Till & Rooms
            </Button>
          </div>
        </div>
      </div>

      {/* 5. Recent Appointments Ledger */}
      <div className="bg-white rounded-3xl border border-[#E3DED6] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#EDE9E1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1C2420]">Recent Session Bookings Ledger</h2>
            <p className="text-xs text-[#54635B] mt-0.5">
              Live intake stream with direct Client Intelligence drill-down and WhatsApp care dispatch.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTabChange('bookings')}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Open Full Ledger
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF9F5] text-[#78867E] uppercase font-bold border-b border-[#E3DED6]">
              <tr>
                <th className="py-3.5 px-4">Ref Code</th>
                <th className="py-3.5 px-4">Client Identity</th>
                <th className="py-3.5 px-4">Service & Delivery</th>
                <th className="py-3.5 px-4">Therapist</th>
                <th className="py-3.5 px-4">Scheduled Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Care Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE9E1]">
              {recentBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-[#FBF9F5] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1C2420]">
                    {booking.booking_reference}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => setSelectedClientForProfile({ phone: booking.client_phone, name: booking.client_name })}
                      className="font-bold text-[#1C2420] hover:text-[#2D5A46] hover:underline cursor-pointer text-left block"
                      title="Open Client Intelligence Modal"
                    >
                      {booking.client_name}
                    </button>
                    <div className="text-[11px] text-[#78867E] mt-0.5">
                      {booking.client_phone}
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
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedBookingForWhatsApp(booking)}
                        className="p-1.5 rounded-lg text-[#286E47] bg-[#E8F3ED] hover:bg-[#D4EBDD] transition-colors cursor-pointer"
                        title="Dispatch WhatsApp Care Template"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onTabChange('bookings')}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#2D5A46] bg-[#EBF2EE] hover:bg-[#DCE7E1] transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Modals */}
      {selectedClientForProfile && (
        <ClientIntelligenceModal
          clientPhone={selectedClientForProfile.phone}
          clientName={selectedClientForProfile.name}
          onClose={() => setSelectedClientForProfile(null)}
          onDispatchWhatsApp={(b) => setSelectedBookingForWhatsApp(b)}
        />
      )}

      {selectedBookingForWhatsApp && (
        <WhatsAppDispatcherModal
          booking={selectedBookingForWhatsApp}
          onClose={() => setSelectedBookingForWhatsApp(null)}
        />
      )}
    </div>
  );
};
