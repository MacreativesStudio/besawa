import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Video,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Loader2,
  Sparkles,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { api } from '../../api';
import { ClientProfile, Booking } from '../../types';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import { useToast } from '../../context/ToastContext';

interface ClientIntelligenceModalProps {
  clientPhone: string;
  clientName?: string;
  onClose: () => void;
  onDispatchWhatsApp?: (booking: Booking) => void;
}

export const ClientIntelligenceModal: React.FC<ClientIntelligenceModalProps> = ({
  clientPhone,
  clientName,
  onClose,
  onDispatchWhatsApp,
}) => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [careNotes, setCareNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    api
      .getAdminClientProfile(clientPhone)
      .then((res) => {
        setProfile(res.profile);
        setCareNotes(res.profile.care_notes || '');
      })
      .catch((err) => {
        showToast(err.message || 'Could not load client profile.', 'error');
      })
      .finally(() => setIsLoading(false));
  }, [clientPhone, showToast]);

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotes(true);
    try {
      await api.updateClientCareNotes(clientPhone, careNotes);
      showToast('Client care coordination notes saved successfully.', 'success');
      if (profile) {
        setProfile({ ...profile, care_notes: careNotes });
      }
    } catch (err: any) {
      showToast(err.message || 'Failed saving care notes.', 'error');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'LONG_TERM_CARE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F7EFEA] text-[#9E5D43] border border-[#9E5D43]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#9E5D43]" />
            <span>Long-Term Care (5+ Sessions)</span>
          </span>
        );
      case 'RETURNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EBF2EE] text-[#2D5A46] border border-[#2D5A46]/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A46]" />
            <span>Active Recurring Client</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FBF9F5] text-[#54635B] border border-[#E3DED6]">
            <User className="w-3.5 h-3.5 text-[#78867E]" />
            <span>First-Time Client</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#E3DED6] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#EDE9E1] bg-gradient-to-r from-white via-[#FBF9F5] to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center font-black text-base shadow-xs border border-[#2D5A46]/20">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : clientName ? clientName.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-[#1C2420]">
                  {profile?.name || clientName || 'Client Profile'}
                </h3>
                {profile && getTierBadge(profile.lifecycle_tier)}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#54635B] mt-0.5">
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-[#2D5A46]" />
                  {profile?.phone || clientPhone}
                </span>
                {profile?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#78867E]" />
                    {profile.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#78867E] hover:text-[#1C2420] hover:bg-[#F4EFEA] rounded-xl transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 text-xs">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#54635B]">
              <Loader2 className="w-8 h-8 animate-spin text-[#2D5A46] mb-3" />
              <p className="font-semibold text-xs">Gathering clinical and session intelligence...</p>
            </div>
          ) : !profile ? (
            <div className="py-12 text-center text-[#54635B]">
              <AlertCircle className="w-8 h-8 mx-auto text-[#A63B30] mb-2" />
              <p className="font-bold text-sm text-[#1C2420]">Could not locate client history</p>
              <p className="text-xs text-[#78867E] mt-1">No bookings found for telephone reference {clientPhone}.</p>
            </div>
          ) : (
            <>
              {/* Executive Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#FBF9F5] p-3.5 rounded-2xl border border-[#EDE9E1]">
                  <div className="text-[10px] text-[#78867E] uppercase font-bold">Lifetime Value</div>
                  <div className="text-lg font-black text-[#2D5A46] mt-0.5">
                    KES {profile.total_spend_kes.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#54635B] mt-0.5">Confirmed & Completed</div>
                </div>

                <div className="bg-[#FBF9F5] p-3.5 rounded-2xl border border-[#EDE9E1]">
                  <div className="text-[10px] text-[#78867E] uppercase font-bold">Total Bookings</div>
                  <div className="text-lg font-black text-[#1C2420] mt-0.5">
                    {profile.total_bookings}
                  </div>
                  <div className="text-[10px] text-[#54635B] mt-0.5">
                    {profile.completed_sessions} Attended ({profile.total_bookings > 0 ? Math.round((profile.completed_sessions / profile.total_bookings) * 100) : 0}%)
                  </div>
                </div>

                <div className="bg-[#FBF9F5] p-3.5 rounded-2xl border border-[#EDE9E1]">
                  <div className="text-[10px] text-[#78867E] uppercase font-bold">Preferred Format</div>
                  <div className="text-sm font-black text-[#1C2420] mt-1 flex items-center gap-1.5">
                    {profile.preferred_delivery_mode === 'ONLINE' ? (
                      <>
                        <Video className="w-3.5 h-3.5 text-[#2D5A46]" /> Online Video
                      </>
                    ) : profile.preferred_delivery_mode === 'IN_PERSON' ? (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-[#9E5D43]" /> Kilimani Sanctuary
                      </>
                    ) : (
                      <>Hybrid (Both)</>
                    )}
                  </div>
                  <div className="text-[10px] text-[#54635B] mt-0.5">Highest session frequency</div>
                </div>

                <div className="bg-[#FBF9F5] p-3.5 rounded-2xl border border-[#EDE9E1]">
                  <div className="text-[10px] text-[#78867E] uppercase font-bold">Relationship Span</div>
                  <div className="text-xs font-black text-[#1C2420] mt-1 truncate">
                    {profile.first_session_date}
                  </div>
                  <div className="text-[10px] text-[#78867E] mt-0.5">
                    Latest: {profile.latest_session_date}
                  </div>
                </div>
              </div>

              {/* Care Coordination & Clinical Admin Notes */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E3DED6] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#2D5A46]" />
                    <h4 className="text-xs font-bold text-[#1C2420] uppercase tracking-wider">
                      Care Coordination & Administrative Notes
                    </h4>
                  </div>
                  <span className="text-[10px] text-[#78867E]">Private • Clinical Admin Only</span>
                </div>

                <form onSubmit={handleSaveNotes} className="space-y-2">
                  <textarea
                    rows={3}
                    value={careNotes}
                    onChange={(e) => setCareNotes(e.target.value)}
                    placeholder="Document care preferences, preferred room setup at Kilimani, trauma considerations, or communication preferences..."
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl p-3 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none placeholder:text-[#78867E]"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isSavingNotes}
                      leftIcon={<Save className="w-3.5 h-3.5" />}
                    >
                      Save Care Notes
                    </Button>
                  </div>
                </form>
              </div>

              {/* Complete Chronological Session Ledger */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-[#1C2420] uppercase tracking-wider flex items-center justify-between">
                  <span>Complete Session History ({profile.bookings.length})</span>
                  <span className="text-[10px] font-normal text-[#78867E]">Sorted by latest appointment</span>
                </h4>

                <div className="overflow-x-auto rounded-2xl border border-[#EDE9E1]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FBF9F5] text-[#78867E] font-bold uppercase border-b border-[#EDE9E1] text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3">Therapist</th>
                        <th className="py-2.5 px-3">Service</th>
                        <th className="py-2.5 px-3">Delivery</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDE9E1]">
                      {profile.bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-[#FBF9F5]/70 transition-colors">
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="font-bold text-[#1C2420]">{b.date}</div>
                            <div className="text-[10px] text-[#78867E] font-mono">{b.time} ({b.duration_minutes || 50}m)</div>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-[#2D5A46] whitespace-nowrap">
                            {b.therapist_name || 'Assigned Therapist'}
                          </td>
                          <td className="py-2.5 px-3 text-[#1C2420] whitespace-nowrap">
                            {b.service_name || 'Therapy Session'}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {b.delivery_mode === 'ONLINE' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#2D5A46] font-medium">
                                <Video className="w-3 h-3" /> Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#9E5D43] font-medium">
                                <MapPin className="w-3 h-3" /> Kilimani
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#1C2420] whitespace-nowrap">
                            KES {b.amount?.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <StatusBadge status={b.status} size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EDE9E1] bg-[#FBF9F5] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#54635B]">
            <ShieldCheck className="w-4 h-4 text-[#286E47]" />
            <span>Protected under Kenya Data Protection Act 2019</span>
          </div>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close Profile
          </Button>
        </div>
      </div>
    </div>
  );
};
