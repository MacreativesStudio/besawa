import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Filter,
  Eye,
  User,
  Phone,
  Mail,
  MessageCircle,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../api';
import { Booking, Service, FullTherapist } from '../../types';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { ClientIntelligenceModal } from '../../components/admin/ClientIntelligenceModal';
import { WhatsAppDispatcherModal } from '../../components/admin/WhatsAppDispatcherModal';

export const AdminBookingsView: React.FC = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [therapists, setTherapists] = useState<FullTherapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deliveryFilter, setDeliveryFilter] = useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Client Intelligence & WhatsApp Dispatcher Modals
  const [selectedClientForProfile, setSelectedClientForProfile] = useState<{ phone: string; name: string } | null>(null);
  const [selectedBookingForWhatsApp, setSelectedBookingForWhatsApp] = useState<Booking | null>(null);

  // Cancellation prompt modal
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('Client requested rescheduling');

  // Manual Booking Creation Modal State
  const [showCreateBookingModal, setShowCreateBookingModal] = useState(false);
  const [isSubmittingNewBooking, setIsSubmittingNewBooking] = useState(false);
  const [newBookingData, setNewBookingData] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    service_id: '',
    therapist_id: '',
    session_date: new Date().toISOString().split('T')[0],
    start_time: '10:00 AM',
    delivery_mode: 'IN_PERSON' as 'IN_PERSON' | 'ONLINE',
    payment_status: 'PAID' as 'PAID' | 'PENDING',
    amount: 1500,
    notes: '',
  });

  // Edit / Reschedule Modal State
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isSavingBookingEdit, setIsSavingBookingEdit] = useState(false);
  const [editBookingData, setEditBookingData] = useState({
    session_date: '',
    start_time: '',
    delivery_mode: 'IN_PERSON' as 'IN_PERSON' | 'ONLINE',
    service_id: '',
    therapist_id: '',
    notes: '',
  });

  // Deletion Modal State
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [isDeletingBooking, setIsDeletingBooking] = useState(false);

  const fetchBookings = () => {
    setIsLoading(true);
    api
      .getAdminBookings()
      .then((res) => setBookings(res.bookings))
      .catch((err) => showToast(err.message || 'Failed loading bookings.', 'error'))
      .finally(() => setIsLoading(false));
  };

  const fetchAuxiliary = () => {
    Promise.all([api.getServices(), api.getAdminTherapists()])
      .then(([sRes, tRes]) => {
        setServices(sRes.services);
        setTherapists(tRes.therapists);
        if (sRes.services.length > 0) {
          setNewBookingData((prev) => ({
            ...prev,
            service_id: prev.service_id || sRes.services[0].id,
            amount: sRes.services[0].price,
          }));
        }
        if (tRes.therapists.length > 0) {
          setNewBookingData((prev) => ({
            ...prev,
            therapist_id: prev.therapist_id || tRes.therapists[0].id,
          }));
        }
      })
      .catch((err) => console.error('Failed auxiliary fetch:', err));
  };

  useEffect(() => {
    fetchBookings();
    fetchAuxiliary();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string, reason?: string) => {
    setActionLoadingId(id);
    try {
      await api.updateBookingStatus(id, newStatus, reason);
      showToast(`Appointment status updated to ${newStatus}.`, 'success');
      fetchBookings();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }
      if (cancellingBooking && cancellingBooking.id === id) {
        setCancellingBooking(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed updating appointment status.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookingData.client_name || !newBookingData.client_phone || !newBookingData.service_id || !newBookingData.therapist_id) {
      showToast('Please fill all required booking fields.', 'error');
      return;
    }

    setIsSubmittingNewBooking(true);
    try {
      const selectedService = services.find((s) => s.id === newBookingData.service_id);
      const selectedTherapist = therapists.find((t) => t.id === newBookingData.therapist_id);

      await api.createAdminBooking({
        client_name: newBookingData.client_name,
        client_phone: newBookingData.client_phone,
        client_email: newBookingData.client_email || undefined,
        service_id: newBookingData.service_id,
        service_name: selectedService?.name,
        therapist_id: newBookingData.therapist_id,
        therapist_name: selectedTherapist?.full_name,
        session_date: newBookingData.session_date,
        start_time: newBookingData.start_time,
        delivery_mode: newBookingData.delivery_mode,
        payment_status: newBookingData.payment_status,
        amount: Number(newBookingData.amount) || selectedService?.price || 1500,
        notes: newBookingData.notes,
      });

      showToast('Appointment successfully created and added to clinical ledger.', 'success');
      setShowCreateBookingModal(false);
      setNewBookingData({
        client_name: '',
        client_phone: '',
        client_email: '',
        service_id: services[0]?.id || '',
        therapist_id: therapists[0]?.id || '',
        session_date: new Date().toISOString().split('T')[0],
        start_time: '10:00 AM',
        delivery_mode: 'IN_PERSON',
        payment_status: 'PAID',
        amount: services[0]?.price || 1500,
        notes: '',
      });
      fetchBookings();
    } catch (err: any) {
      showToast(err.message || 'Failed creating appointment.', 'error');
    } finally {
      setIsSubmittingNewBooking(false);
    }
  };

  const handleOpenEditBooking = (b: Booking) => {
    setEditingBooking(b);
    setEditBookingData({
      session_date: b.date,
      start_time: b.time,
      delivery_mode: b.delivery_mode,
      service_id: b.service_id || (services[0]?.id ?? ''),
      therapist_id: b.therapist_id || (therapists[0]?.id ?? ''),
      notes: b.client_notes || '',
    });
  };

  const handleSaveEditBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    setIsSavingBookingEdit(true);
    try {
      const selectedService = services.find((s) => s.id === editBookingData.service_id);
      const selectedTherapist = therapists.find((t) => t.id === editBookingData.therapist_id);

      await api.updateAdminBooking(editingBooking.id, {
        session_date: editBookingData.session_date,
        start_time: editBookingData.start_time,
        delivery_mode: editBookingData.delivery_mode,
        service_id: editBookingData.service_id || undefined,
        service_name: selectedService?.name,
        therapist_id: editBookingData.therapist_id || undefined,
        therapist_name: selectedTherapist?.full_name,
        notes: editBookingData.notes,
      });

      showToast('Appointment details & schedule updated.', 'success');
      setEditingBooking(null);
      if (selectedBooking && selectedBooking.id === editingBooking.id) {
        setSelectedBooking(null);
      }
      fetchBookings();
    } catch (err: any) {
      showToast(err.message || 'Failed updating appointment details.', 'error');
    } finally {
      setIsSavingBookingEdit(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!deletingBooking) return;
    setIsDeletingBooking(true);
    try {
      await api.deleteAdminBooking(deletingBooking.id);
      showToast(`Booking ${deletingBooking.booking_reference} removed from ledger.`, 'success');
      setBookings((prev) => prev.filter((b) => b.id !== deletingBooking.id));
      setDeletingBooking(null);
      if (selectedBooking && selectedBooking.id === deletingBooking.id) {
        setSelectedBooking(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed deleting booking.', 'error');
    } finally {
      setIsDeletingBooking(false);
    }
  };

  // Status counts
  const counts = {
    all: bookings.length,
    confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
    pending: bookings.filter((b) => b.status === 'PENDING_CONFIRMATION' || b.status === 'PENDING_PAYMENT').length,
    completed: bookings.filter((b) => b.status === 'COMPLETED').length,
    cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
  };

  const filtered = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      b.booking_reference.toLowerCase().includes(q) ||
      b.client_name.toLowerCase().includes(q) ||
      b.client_phone.toLowerCase().includes(q) ||
      (b.therapist_name && b.therapist_name.toLowerCase().includes(q)) ||
      (b.service_name && b.service_name.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesDelivery = deliveryFilter === 'ALL' || b.delivery_mode === deliveryFilter;

    return matchesQuery && matchesStatus && matchesDelivery;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2420]">Session Bookings Ledger</h1>
          <p className="text-xs text-[#54635B] mt-1">
            Dispatch, view client appointments, verify attendance, and handle session completions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateBookingModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Booking / Walk-In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBookings}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh List
          </Button>
        </div>
      </div>

      {/* Status Tab Chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          { id: 'ALL', label: 'All Sessions', count: counts.all },
          { id: 'CONFIRMED', label: 'Confirmed', count: counts.confirmed },
          { id: 'PENDING_CONFIRMATION', label: 'Needs Confirmation', count: counts.pending },
          { id: 'COMPLETED', label: 'Completed', count: counts.completed },
          { id: 'CANCELLED', label: 'Cancelled', count: counts.cancelled },
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

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-[#E3DED6] shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#78867E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by reference (BS-XXXX), client name, phone number, or therapist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#78867E] hover:text-[#1C2420]"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#78867E] shrink-0" />
          <select
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
            className="w-full sm:w-auto bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs font-semibold text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
          >
            <option value="ALL">All Delivery Formats</option>
            <option value="ONLINE">Online Telehealth</option>
            <option value="IN_PERSON">Kilimani In-Person</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#54635B] bg-white rounded-2xl border border-[#E3DED6]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2D5A46] mb-2" />
          <p className="text-xs font-medium">Loading session appointments ledger...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#E3DED6] p-8 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FBF9F5] text-[#78867E] flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-[#1C2420]">No appointments found</p>
          <p className="text-xs text-[#78867E] mt-1">
            Try adjusting your search criteria or switching the status filter tabs.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E3DED6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF9F5] text-[#78867E] uppercase font-bold border-b border-[#E3DED6]">
                <tr>
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">Client & Contact</th>
                  <th className="py-3.5 px-4">Service & Format</th>
                  <th className="py-3.5 px-4">Therapist</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE9E1]">
                {filtered.map((b) => {
                  const isActionLoading = actionLoadingId === b.id;
                  return (
                    <tr key={b.id} className="hover:bg-[#FBF9F5] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#2D5A46] whitespace-nowrap">
                        {b.booking_reference}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSelectedClientForProfile({ phone: b.client_phone, name: b.client_name })}
                          className="font-semibold text-[#1C2420] hover:text-[#2D5A46] hover:underline cursor-pointer text-left block"
                          title="Open Client Intelligence Profile"
                        >
                          {b.client_name}
                        </button>
                        <div className="text-[11px] text-[#54635B]">{b.client_phone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#1C2420]">{b.service_name}</div>
                        <div className="text-[10px] text-[#78867E] flex items-center gap-1 mt-0.5">
                          {b.delivery_mode === 'ONLINE' ? (
                            <>
                              <Video className="w-3 h-3 text-[#2D5A46]" /> Online Video
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3 h-3 text-[#9E5D43]" /> Kilimani Rooms
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#1C2420]">
                        {b.therapist_name}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#1C2420]">{b.date}</div>
                        <div className="text-[11px] text-[#54635B]">
                          {b.time} ({b.duration_minutes}m)
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={b.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 text-[#54635B] hover:text-[#1C2420] hover:bg-[#F4EFEA] rounded-lg cursor-pointer transition-colors"
                            title="View Full Booking Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setSelectedBookingForWhatsApp(b)}
                            className="p-1.5 text-[#286E47] hover:bg-[#E8F3ED] rounded-lg cursor-pointer transition-colors"
                            title="Dispatch WhatsApp Care Template"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          {b.status === 'CONFIRMED' && (
                            <button
                              disabled={isActionLoading}
                              onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#286E47] hover:bg-[#205738] rounded-lg cursor-pointer transition-colors"
                            >
                              Complete
                            </button>
                          )}

                          {b.status === 'PENDING_PAYMENT' && (
                            <button
                              disabled={isActionLoading}
                              onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#2D5A46] hover:bg-[#234838] rounded-lg cursor-pointer transition-colors"
                            >
                              Confirm
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEditBooking(b)}
                            className="p-1.5 text-[#54635B] hover:text-[#2D5A46] hover:bg-[#EBF2EE] rounded-lg cursor-pointer transition-colors"
                            title="Edit / Reschedule Appointment"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                            <button
                              disabled={isActionLoading}
                              onClick={() => setCancellingBooking(b)}
                              className="p-1.5 text-[#A63B30] hover:bg-[#FCECE9] rounded-lg cursor-pointer transition-colors"
                              title="Cancel Session"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setDeletingBooking(b)}
                            className="p-1.5 text-[#A63B30] hover:text-red-700 hover:bg-[#FCECE9] rounded-lg cursor-pointer transition-colors"
                            title="Delete Appointment from Ledger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E3DED6] shadow-2xl space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#EDE9E1]">
              <div>
                <span className="text-[10px] font-bold text-[#78867E] uppercase tracking-wider">
                  Appointment Reference
                </span>
                <div className="text-xl font-black text-[#2D5A46]">
                  {selectedBooking.booking_reference}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedBooking.status} />
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 text-[#78867E] hover:text-[#1C2420] rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              {/* Client Card with Direct Communication Links */}
              <div className="p-4 bg-[#FBF9F5] rounded-2xl border border-[#EDE9E1] space-y-2">
                <div className="text-[10px] uppercase font-bold text-[#78867E] tracking-wider">
                  Client Dossier
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-bold text-[#1C2420] text-sm">{selectedBooking.client_name}</div>
                  <a
                    href={`https://wa.me/254${selectedBooking.client_phone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(
                      `Hello ${selectedBooking.client_name}, this is Be Sawa Psychological Sanctuary regarding your appointment (${selectedBooking.booking_reference}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#25D366] bg-[#EBF2EE] hover:bg-[#DCE7E1] px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-[#25D366]" />
                    <span>WhatsApp Client</span>
                  </a>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#54635B] pt-1">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-[#78867E]" />
                    <a href={`tel:${selectedBooking.client_phone}`} className="hover:underline">
                      {selectedBooking.client_phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-[#78867E]" />
                    <a href={`mailto:${selectedBooking.client_email}`} className="hover:underline truncate">
                      {selectedBooking.client_email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Service & Practitioner */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#FBF9F5] rounded-2xl border border-[#EDE9E1]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#78867E]">Counselling Service</span>
                  <div className="font-bold text-[#1C2420] text-xs mt-0.5">{selectedBooking.service_name}</div>
                  <div className="text-[11px] text-[#54635B]">
                    {selectedBooking.duration_minutes} Minutes
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#78867E]">Assigned Therapist</span>
                  <div className="font-bold text-[#1C2420] text-xs mt-0.5">{selectedBooking.therapist_name}</div>
                  <div className="text-[11px] text-[#286E47] font-semibold">Verified Practitioner</div>
                </div>
              </div>

              {/* Schedule & Location */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#FBF9F5] rounded-2xl border border-[#EDE9E1]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#78867E]">Session Time</span>
                  <div className="font-bold text-[#1C2420] text-xs mt-0.5">
                    {selectedBooking.date} at {selectedBooking.time}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#78867E]">Delivery Mode</span>
                  <div className="font-bold text-[#1C2420] text-xs mt-0.5">
                    {selectedBooking.delivery_mode === 'ONLINE'
                      ? 'Secure Online Telehealth'
                      : 'Kilimani Consulting Rooms'}
                  </div>
                </div>
              </div>

              {/* Client Notes */}
              {selectedBooking.client_notes && (
                <div className="bg-[#FAF2E4] p-3.5 rounded-2xl border border-[#D6A54A]/30">
                  <span className="text-[10px] uppercase font-bold text-[#9E6B1F] block mb-1">
                    Client's Pre-Session Note
                  </span>
                  <p className="text-[#1C2420] italic text-xs leading-relaxed">
                    "{selectedBooking.client_notes}"
                  </p>
                </div>
              )}

              {/* Payment Details */}
              {selectedBooking.payment && (
                <div className="bg-[#EBF2EE] p-4 rounded-2xl border border-[#2D5A46]/20 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#2D5A46] tracking-wider">
                    Safaricom M-Pesa Transaction Receipt
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#1C2420]">
                    <span>Amount Paid:</span>
                    <span>KES {selectedBooking.payment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#54635B]">
                    <span>Receipt Reference:</span>
                    <span className="font-mono font-bold text-[#2D5A46]">
                      {selectedBooking.payment.provider_reference || 'Awaiting STK confirmation'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#54635B]">
                    <span>Payment State:</span>
                    <span className="font-bold text-[#286E47]">{selectedBooking.payment.status}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-[#EDE9E1] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {selectedBooking.status === 'PENDING_PAYMENT' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'CONFIRMED')}
                  >
                    Confirm Payment
                  </Button>
                )}
                {selectedBooking.status === 'CONFIRMED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'COMPLETED')}
                  >
                    Mark as Concluded
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEditBooking(selectedBooking)}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Reschedule / Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingBooking(selectedBooking)}
                  className="text-[#A63B30] border-[#F8D8D3] hover:bg-[#FCECE9]"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Delete
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E3DED6] shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-[#A63B30]">
              <div className="w-10 h-10 rounded-xl bg-[#FCECE9] flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1C2420]">Cancel Appointment</h3>
                <p className="text-xs text-[#54635B]">Ref: {cancellingBooking.booking_reference}</p>
              </div>
            </div>

            <p className="text-xs text-[#54635B]">
              Are you sure you want to cancel the appointment for <strong>{cancellingBooking.client_name}</strong>?
              Please specify the cancellation reason for the clinical record.
            </p>

            <div>
              <label className="block text-xs font-bold text-[#1C2420] mb-1">
                Reason for Cancellation
              </label>
              <textarea
                rows={3}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl p-3 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancellingBooking(null)}
              >
                Keep Session
              </Button>
              <button
                onClick={() => handleUpdateStatus(cancellingBooking.id, 'CANCELLED', cancellationReason)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#A63B30] hover:bg-[#8D2B21] transition-colors cursor-pointer"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Intelligence Modal */}
      {selectedClientForProfile && (
        <ClientIntelligenceModal
          clientPhone={selectedClientForProfile.phone}
          clientName={selectedClientForProfile.name}
          onClose={() => setSelectedClientForProfile(null)}
          onDispatchWhatsApp={(b) => setSelectedBookingForWhatsApp(b)}
        />
      )}

      {/* WhatsApp Care Dispatcher Modal */}
      {selectedBookingForWhatsApp && (
        <WhatsAppDispatcherModal
          booking={selectedBookingForWhatsApp}
          onClose={() => setSelectedBookingForWhatsApp(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* 1. MANUAL APPOINTMENT CREATION / WALK-IN MODAL */}
      {/* ========================================================================= */}
      {showCreateBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#E3DED6] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E1]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C2420]">Create Clinical Appointment</h3>
                  <p className="text-xs text-[#54635B]">Manual walk-in or direct phone/WhatsApp booking</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateBookingModal(false)}
                className="p-1.5 text-[#78867E] hover:text-[#1C2420] rounded-lg hover:bg-[#F4EFEA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Client Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newBookingData.client_name}
                    onChange={(e) => setNewBookingData({ ...newBookingData, client_name: e.target.value })}
                    placeholder="e.g. Grace Wambui"
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Phone Number (M-Pesa) *</label>
                  <input
                    type="tel"
                    required
                    value={newBookingData.client_phone}
                    onChange={(e) => setNewBookingData({ ...newBookingData, client_phone: e.target.value })}
                    placeholder="e.g. 0712345678"
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">Client Email (Optional)</label>
                <input
                  type="email"
                  value={newBookingData.client_email}
                  onChange={(e) => setNewBookingData({ ...newBookingData, client_email: e.target.value })}
                  placeholder="e.g. grace@example.com"
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Therapy Service *</label>
                  <select
                    value={newBookingData.service_id}
                    onChange={(e) => {
                      const s = services.find((x) => x.id === e.target.value);
                      setNewBookingData({
                        ...newBookingData,
                        service_id: e.target.value,
                        amount: s?.price || newBookingData.amount,
                      });
                    }}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (KES {s.price.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Attending Practitioner *</label>
                  <select
                    value={newBookingData.therapist_id}
                    onChange={(e) => setNewBookingData({ ...newBookingData, therapist_id: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  >
                    {therapists.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name} ({t.title})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Session Date *</label>
                  <input
                    type="date"
                    required
                    value={newBookingData.session_date}
                    onChange={(e) => setNewBookingData({ ...newBookingData, session_date: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Start Time *</label>
                  <input
                    type="text"
                    required
                    value={newBookingData.start_time}
                    onChange={(e) => setNewBookingData({ ...newBookingData, start_time: e.target.value })}
                    placeholder="e.g. 10:00 AM"
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Delivery Mode *</label>
                  <select
                    value={newBookingData.delivery_mode}
                    onChange={(e) => setNewBookingData({ ...newBookingData, delivery_mode: e.target.value as any })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  >
                    <option value="IN_PERSON">In-Person (Kilimani)</option>
                    <option value="ONLINE">Online (Google Meet)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Payment Status *</label>
                  <select
                    value={newBookingData.payment_status}
                    onChange={(e) => setNewBookingData({ ...newBookingData, payment_status: e.target.value as any })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  >
                    <option value="PAID">Paid (M-Pesa / Cash / Card)</option>
                    <option value="PENDING">Pending Settlement</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Fee (KES) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newBookingData.amount}
                    onChange={(e) => setNewBookingData({ ...newBookingData, amount: Number(e.target.value) })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] font-mono focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">Clinical Context / Care Notes</label>
                <textarea
                  rows={2}
                  value={newBookingData.notes}
                  onChange={(e) => setNewBookingData({ ...newBookingData, notes: e.target.value })}
                  placeholder="Walk-in referral, presenting concern, or intake notes..."
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl p-3 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateBookingModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingNewBooking}>
                  Schedule &amp; Add to Ledger
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT / RESCHEDULE APPOINTMENT MODAL */}
      {/* ========================================================================= */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E3DED6] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E1]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FAF2E4] text-[#9E6B1F] flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C2420]">Edit / Reschedule Appointment</h3>
                  <p className="text-xs text-[#54635B]">Ref: {editingBooking.booking_reference}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingBooking(null)}
                className="p-1.5 text-[#78867E] hover:text-[#1C2420] rounded-lg hover:bg-[#F4EFEA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FBF9F5] p-3 rounded-xl border border-[#EDE9E1] text-xs space-y-1">
              <div className="font-bold text-[#1C2420]">Client: {editingBooking.client_name}</div>
              <div className="text-[#54635B]">Phone: {editingBooking.client_phone}</div>
            </div>

            <form onSubmit={handleSaveEditBooking} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Session Date *</label>
                  <input
                    type="date"
                    required
                    value={editBookingData.session_date}
                    onChange={(e) => setEditBookingData({ ...editBookingData, session_date: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Start Time *</label>
                  <input
                    type="text"
                    required
                    value={editBookingData.start_time}
                    onChange={(e) => setEditBookingData({ ...editBookingData, start_time: e.target.value })}
                    placeholder="e.g. 02:00 PM"
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">Delivery Mode *</label>
                <select
                  value={editBookingData.delivery_mode}
                  onChange={(e) => setEditBookingData({ ...editBookingData, delivery_mode: e.target.value as any })}
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                >
                  <option value="IN_PERSON">In-Person (Kilimani Consultation Rooms)</option>
                  <option value="ONLINE">Online Telehealth (Google Meet)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Therapy Service</label>
                  <select
                    value={editBookingData.service_id}
                    onChange={(e) => setEditBookingData({ ...editBookingData, service_id: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Practitioner</label>
                  <select
                    value={editBookingData.therapist_id}
                    onChange={(e) => setEditBookingData({ ...editBookingData, therapist_id: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  >
                    {therapists.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">Internal Clinical Notes</label>
                <textarea
                  rows={2}
                  value={editBookingData.notes}
                  onChange={(e) => setEditBookingData({ ...editBookingData, notes: e.target.value })}
                  placeholder="Rescheduling reason, room allocation, or special accommodations..."
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl p-3 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingBooking(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSavingBookingEdit}>
                  Save Updates
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DELETE BOOKING CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E3DED6] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-[#A63B30]">
              <div className="w-10 h-10 rounded-2xl bg-[#FCECE9] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#A63B30]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1C2420]">Delete Booking from Ledger?</h3>
                <p className="text-xs text-[#78867E]">Ref: {deletingBooking.booking_reference}</p>
              </div>
            </div>
            <p className="text-xs text-[#54635B] bg-[#FBF9F5] p-3 rounded-xl border border-[#EDE9E1]">
              Are you sure you want to delete the booking for <strong className="text-[#1C2420]">{deletingBooking.client_name}</strong> on {deletingBooking.date}? This should only be done for test or erroneous entries.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeletingBooking(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteBooking}
                isLoading={isDeletingBooking}
                className="bg-[#A63B30] hover:bg-red-700 text-white border-transparent"
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
