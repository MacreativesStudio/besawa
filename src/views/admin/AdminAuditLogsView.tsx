import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Search,
  RefreshCw,
  Loader2,
  Key,
  Database,
  UserCheck,
  CreditCard,
  Calendar,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../../api';
import { AuditLog } from '../../types';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const AdminAuditLogsView: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = () => {
    setIsLoading(true);
    api
      .getAuditLogs()
      .then((res) => setLogs(res.logs))
      .catch((err) => showToast(err.message || 'Failed loading audit logs.', 'error'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      log.action.toLowerCase().includes(q) ||
      log.entity_type.toLowerCase().includes(q) ||
      (log.actor_email && log.actor_email.toLowerCase().includes(q)) ||
      (log.entity_id && log.entity_id.toLowerCase().includes(q));

    let matchesCategory = true;
    if (categoryFilter === 'BOOKINGS') matchesCategory = log.entity_type === 'BOOKING';
    else if (categoryFilter === 'THERAPISTS') matchesCategory = log.entity_type === 'THERAPIST';
    else if (categoryFilter === 'SETTLEMENTS') matchesCategory = log.entity_type === 'SETTLEMENT';
    else if (categoryFilter === 'AUTH') matchesCategory = log.action.includes('AUTH') || log.action.includes('LOGIN');

    return matchesQuery && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2420]">Security & System Audit Trail</h1>
          <p className="text-xs text-[#54635B] mt-1">
            Immutable log of all administrative actions, clinical verification state mutations, and payment confirmations.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Log
        </Button>
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          { id: 'ALL', label: 'All Security Events' },
          { id: 'BOOKINGS', label: 'Appointments & Dispatch' },
          { id: 'THERAPISTS', label: 'Therapist Governance' },
          { id: 'SETTLEMENTS', label: 'Financial Settlements' },
          { id: 'AUTH', label: 'Authentication & Access' },
        ].map((tab) => {
          const isActive = categoryFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2D5A46] text-white shadow-xs'
                  : 'bg-white text-[#54635B] hover:text-[#1C2420] border border-[#E3DED6]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3DED6] shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-[#78867E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail by action, entity ID, or staff email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#54635B] bg-white rounded-2xl border border-[#E3DED6]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2D5A46] mb-2" />
          <p className="text-xs font-medium">Loading immutable audit logs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#E3DED6] p-8 shadow-xs">
          <p className="text-sm font-bold text-[#1C2420]">No audit records found</p>
          <p className="text-xs text-[#78867E] mt-1">Actions are logged automatically upon administrative mutations.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E3DED6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF9F5] text-[#78867E] uppercase font-bold border-b border-[#E3DED6]">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Staff Actor</th>
                  <th className="py-3.5 px-4">Action Event</th>
                  <th className="py-3.5 px-4">Entity Type</th>
                  <th className="py-3.5 px-4">Entity ID</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE9E1]">
                {filtered.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-[#FBF9F5] transition-colors font-mono">
                        <td className="py-3 px-4 text-[#54635B] whitespace-nowrap text-[11px]">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#1C2420] whitespace-nowrap font-sans">
                          {log.actor_email || log.actor_id}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-[#EBF2EE] text-[#2D5A46] font-bold text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#54635B] font-sans">
                          {log.entity_type}
                        </td>
                        <td className="py-3 px-4 text-[#78867E] text-[11px]">
                          {log.entity_id}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {log.metadata && Object.keys(log.metadata).length > 0 ? (
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="text-[11px] font-sans font-semibold text-[#2D5A46] hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          ) : (
                            <span className="text-[#78867E] text-[11px] font-sans">—</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && log.metadata && (
                        <tr className="bg-[#FAF8F5]">
                          <td colSpan={6} className="px-4 py-3 border-b border-[#EDE9E1]">
                            <div className="p-3 bg-white rounded-xl border border-[#E3DED6] text-[11px] font-mono text-[#1C2420] overflow-x-auto">
                              <span className="text-[#78867E] block mb-1 font-bold font-sans">Event Metadata Payload:</span>
                              <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
