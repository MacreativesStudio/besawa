import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  DollarSign,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Loader2,
  FileText,
  Send,
  Download,
  X,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../api';
import { Settlement } from '../../types';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const AdminSettlementsView: React.FC = () => {
  const { showToast } = useToast();
  const { isSuperAdmin, isAdmin } = useAuth();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Payout action modal
  const [activeSettlement, setActiveSettlement] = useState<Settlement | null>(null);
  const [payoutStatus, setPayoutStatus] = useState<string>('PAID');
  const [payoutReference, setPayoutReference] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchSettlements = () => {
    setIsLoading(true);
    api
      .getAdminSettlements()
      .then((res) => setSettlements(res.settlements))
      .catch((err) => showToast(err.message || 'Failed loading settlements.', 'error'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const handleUpdateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSettlement) return;

    setIsUpdating(true);
    try {
      const ref = payoutReference || `B2C-MP-${Math.floor(100000 + Math.random() * 900000)}`;
      await api.updateSettlementStatus(
        activeSettlement.id,
        payoutStatus,
        ref,
        adminNotes || undefined
      );
      showToast(`Settlement marked as ${payoutStatus} (Ref: ${ref}).`, 'success');
      setActiveSettlement(null);
      setPayoutReference('');
      setAdminNotes('');
      fetchSettlements();
    } catch (err: any) {
      showToast(err.message || 'Failed updating settlement.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Settlement ID,Therapist,Client,Session Date,Gross (KES),Commission (20%),Payable (80%),Status,Payout Ref\n'];
    const rows = filtered.map((s) =>
      `"${s.id}","${s.therapist_name || ''}","${s.client_name || ''}","${s.session_date || ''}",${s.gross_session_amount},${s.platform_commission_amount},${s.therapist_payable_amount},"${s.settlement_status}","${s.payout_reference || ''}"\n`
    );
    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `besawa_settlements_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('Settlement ledger exported to CSV.', 'success');
  };

  const counts = {
    all: settlements.length,
    pending: settlements.filter((s) => s.settlement_status === 'PENDING').length,
    approved: settlements.filter((s) => s.settlement_status === 'APPROVED').length,
    paid: settlements.filter((s) => s.settlement_status === 'PAID').length,
  };

  const filtered = settlements.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      (s.therapist_name && s.therapist_name.toLowerCase().includes(q)) ||
      (s.client_name && s.client_name.toLowerCase().includes(q)) ||
      (s.payout_reference && s.payout_reference.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || s.settlement_status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const totalGross = filtered.reduce((acc, s) => acc + (s.gross_session_amount || 0), 0);
  const totalCommission = filtered.reduce((acc, s) => acc + (s.platform_commission_amount || 0), 0);
  const totalPayable = filtered.reduce((acc, s) => acc + (s.therapist_payable_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2420]">Practitioner Settlement Ledger</h1>
          <p className="text-xs text-[#54635B] mt-1">
            Automated 80/20 platform split. Tracks practitioner disbursements and M-Pesa B2C payout references.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSettlements}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Aggregate Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E3DED6] shadow-xs">
          <span className="text-xs font-semibold text-[#78867E]">Filtered Gross Total</span>
          <div className="text-2xl sm:text-3xl font-black text-[#1C2420] mt-1">
            KES {totalGross.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#54635B] mt-0.5">100% total collected</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#2D5A46]/30 bg-[#EBF2EE] shadow-xs">
          <span className="text-xs font-semibold text-[#2D5A46]">Be Sawa Commission (20%)</span>
          <div className="text-2xl sm:text-3xl font-black text-[#2D5A46] mt-1">
            KES {totalCommission.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#2D5A46] mt-0.5">Platform retained revenue</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#9E5D43]/30 bg-[#F7EFEA] shadow-xs">
          <span className="text-xs font-semibold text-[#9E5D43]">Therapist Payout Pool (80%)</span>
          <div className="text-2xl sm:text-3xl font-black text-[#9E5D43] mt-1">
            KES {totalPayable.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#9E5D43] mt-0.5">Earned by practitioners</div>
        </div>
      </div>

      {/* Status Tab Chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          { id: 'ALL', label: 'All Settlements', count: counts.all },
          { id: 'PENDING', label: 'Pending Payout', count: counts.pending },
          { id: 'APPROVED', label: 'Approved for Release', count: counts.approved },
          { id: 'PAID', label: 'Disbursed (Paid)', count: counts.paid },
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#2D5A46] text-white shadow-xs'
                  : 'bg-white text-[#54635B] hover:text-[#1C2420] border border-[#E3DED6]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#EBF2EE] text-[#2D5A46]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3DED6] shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-[#78867E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by therapist name, client, or M-Pesa payout reference..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
          />
        </div>
      </div>

      {/* Settlement Table */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#54635B] bg-white rounded-2xl border border-[#E3DED6]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2D5A46] mb-2" />
          <p className="text-xs font-medium">Calculating settlement balances...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#E3DED6] p-8 shadow-xs">
          <p className="text-sm font-bold text-[#1C2420]">No settlements found</p>
          <p className="text-xs text-[#78867E] mt-1">Try adjusting your search criteria or status filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E3DED6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF9F5] text-[#78867E] uppercase font-bold border-b border-[#E3DED6]">
                <tr>
                  <th className="py-3.5 px-4">Therapist</th>
                  <th className="py-3.5 px-4">Session Date & Client</th>
                  <th className="py-3.5 px-4">Gross (100%)</th>
                  <th className="py-3.5 px-4">Platform (20%)</th>
                  <th className="py-3.5 px-4">Therapist (80%)</th>
                  <th className="py-3.5 px-4">Status & Ref</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE9E1]">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-[#FBF9F5] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#1C2420] whitespace-nowrap">
                      {s.therapist_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1C2420]">{s.session_date}</div>
                      <div className="text-[11px] text-[#54635B]">{s.client_name}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1C2420] whitespace-nowrap">
                      KES {s.gross_session_amount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#2D5A46] font-semibold whitespace-nowrap">
                      KES {s.platform_commission_amount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-[#9E5D43] font-bold text-sm whitespace-nowrap">
                      KES {s.therapist_payable_amount?.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={s.settlement_status} size="sm" />
                      {s.payout_reference && (
                        <div className="text-[10px] font-mono text-[#78867E] mt-0.5">
                          {s.payout_reference}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setActiveSettlement(s);
                          setPayoutStatus(s.settlement_status === 'PAID' ? 'APPROVED' : 'PAID');
                          setPayoutReference(s.payout_reference || '');
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-[#E3DED6] bg-white text-[#1C2420] hover:bg-[#F4EFEA] cursor-pointer transition-colors"
                      >
                        Disburse
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payout Action Modal */}
      {activeSettlement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E3DED6] shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E1]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#2D5A46]" />
                <h3 className="text-base font-bold text-[#1C2420]">Update Payout Ledger</h3>
              </div>
              <button
                onClick={() => setActiveSettlement(null)}
                className="p-1 text-[#78867E] hover:text-[#1C2420]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#FBF9F5] rounded-2xl border border-[#EDE9E1] text-xs space-y-1">
              <div className="font-bold text-[#1C2420]">{activeSettlement.therapist_name}</div>
              <div className="text-[#54635B]">Client: {activeSettlement.client_name}</div>
              <div className="text-[#9E5D43] font-bold text-sm pt-1">
                Therapist Net: KES {activeSettlement.therapist_payable_amount?.toLocaleString()} (80%)
              </div>
            </div>

            <form onSubmit={handleUpdateSettlement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1C2420] mb-1.5">
                  Settlement Status
                </label>
                <select
                  value={payoutStatus}
                  onChange={(e) => setPayoutStatus(e.target.value)}
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                >
                  <option value="PAID">PAID (Disbursed via M-Pesa B2C)</option>
                  <option value="APPROVED">APPROVED (Queued for Weekly Payout)</option>
                  <option value="PENDING">PENDING (Awaiting Session Verification)</option>
                  <option value="ON_HOLD">ON_HOLD (Under Administrative Review)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1C2420] mb-1.5">
                  Safaricom B2C Transaction Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g., B2C-MP-984712 (Leave blank to auto-generate)"
                  value={payoutReference}
                  onChange={(e) => setPayoutReference(e.target.value)}
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2 text-xs font-mono text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1C2420] mb-1.5">
                  Administrative Ledger Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Weekly Friday disbursement processed to Safaricom phone number..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl p-3 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveSettlement(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isUpdating}
                >
                  Confirm Payout Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
