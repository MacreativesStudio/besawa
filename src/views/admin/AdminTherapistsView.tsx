import React, { useEffect, useState } from 'react';
import {
  Users,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Eye,
  Award,
  BookOpen,
  Filter,
  X,
  MapPin,
  Video,
  Languages,
  Clock,
  FileCheck,
  RefreshCw,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../api';
import { FullTherapist, Service } from '../../types';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ResponsiveImage } from '../../components/common/ResponsiveImage';
import { useToast } from '../../context/ToastContext';

export const AdminTherapistsView: React.FC = () => {
  const { showToast } = useToast();
  const [therapists, setTherapists] = useState<FullTherapist[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTherapist, setSelectedTherapist] = useState<FullTherapist | null>(null);
  const [editingTherapist, setEditingTherapist] = useState<FullTherapist | null>(null);
  const [deletingTherapist, setDeletingTherapist] = useState<FullTherapist | null>(null);
  const [isDeletingTherapist, setIsDeletingTherapist] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editProfile, setEditProfile] = useState({
    full_name: '', title: '', bio: '', years_experience: 0, languages: '', areas_of_practice: '', profile_photo_url: '', supports_online: true, supports_in_person: true,
  });

  // Verification change modal state
  const [verifyingTherapist, setVerifyingTherapist] = useState<FullTherapist | null>(null);
  const [newStatus, setNewStatus] = useState('VERIFIED');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // New Therapist Onboarding Modal
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [newTherapistData, setNewTherapistData] = useState({
    full_name: '',
    title: 'Licensed Counselling Psychologist',
    bio: '',
    years_experience: 5,
    languages: 'English, Swahili',
    areas_of_practice: 'Anxiety, Trauma & PTSD, Depression, Grief',
    profile_photo_url: '',
    supports_online: true,
    supports_in_person: true,
    service_ids: [] as string[],
    internal_admin_notes: 'Initial clinical screening and credentials verified.',
  });
  const [isOnboardingSubmitting, setIsOnboardingSubmitting] = useState(false);

  const fetchTherapists = () => {
    setIsLoading(true);
    Promise.all([api.getAdminTherapists(), api.getServices()])
      .then(([tRes, sRes]) => {
        setTherapists(tRes.therapists);
        setServices(sRes.services);
      })
      .catch((err) => showToast(err.message || 'Failed loading therapists.', 'error'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  const handleUpdateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingTherapist) return;

    setIsUpdatingStatus(true);
    try {
      await api.updateTherapistVerification(
        verifyingTherapist.id,
        newStatus,
        adminNotes || undefined
      );
      showToast(
        `Verification updated to ${newStatus} for ${verifyingTherapist.full_name}.`,
        'success'
      );
      setVerifyingTherapist(null);
      setAdminNotes('');
      fetchTherapists();
    } catch (err: any) {
      showToast(err.message || 'Failed updating verification status.', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteTherapist = async () => {
    if (!deletingTherapist) return;
    setIsDeletingTherapist(true);
    try {
      await api.deleteAdminTherapist(deletingTherapist.id);
      showToast(`Practitioner profile for ${deletingTherapist.full_name} deleted.`, 'success');
      setTherapists((prev) => prev.filter((t) => t.id !== deletingTherapist.id));
      setDeletingTherapist(null);
    } catch (err: any) {
      showToast(err.message || 'Failed deleting practitioner.', 'error');
    } finally {
      setIsDeletingTherapist(false);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTherapistData.full_name || !newTherapistData.bio) {
      showToast('Please provide practitioner name and clinical biography.', 'error');
      return;
    }

    setIsOnboardingSubmitting(true);
    try {
      const payload = {
        ...newTherapistData,
        languages: newTherapistData.languages.split(',').map((s) => s.trim()),
        areas_of_practice: newTherapistData.areas_of_practice.split(',').map((s) => s.trim()),
        service_ids:
          newTherapistData.service_ids.length > 0
            ? newTherapistData.service_ids
            : services.map((s) => s.id),
      };

      await api.createAdminTherapist(payload);
      showToast(`Therapist ${newTherapistData.full_name} onboarded successfully.`, 'success');
      setIsOnboardingOpen(false);
      fetchTherapists();
    } catch (err: any) {
      showToast(err.message || 'Failed onboarding practitioner.', 'error');
    } finally {
      setIsOnboardingSubmitting(false);
    }
  };

  const openEditProfile = (therapist: FullTherapist) => {
    setEditingTherapist(therapist);
    setEditProfile({
      full_name: therapist.full_name,
      title: therapist.title || '',
      bio: therapist.bio || '',
      years_experience: therapist.years_experience || 0,
      languages: therapist.languages.join(', '),
      areas_of_practice: therapist.areas_of_practice.join(', '),
      profile_photo_url: therapist.profile_photo_url || '',
      supports_online: therapist.supports_online,
      supports_in_person: therapist.supports_in_person,
    });
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingTherapist || !editProfile.full_name.trim()) return;
    setIsSavingProfile(true);
    try {
      await api.updateAdminTherapist(editingTherapist.id, {
        ...editProfile,
        languages: editProfile.languages.split(',').map((value) => value.trim()).filter(Boolean),
        areas_of_practice: editProfile.areas_of_practice.split(',').map((value) => value.trim()).filter(Boolean),
      });
      showToast(`${editProfile.full_name} has been saved. Publish only after reviewing the profile.`, 'success');
      setEditingTherapist(null);
      fetchTherapists();
    } catch (err: any) {
      showToast(err.message || 'Could not save this profile.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const counts = {
    all: therapists.length,
    verified: therapists.filter((t) => t.verification_status === 'VERIFIED').length,
    underReview: therapists.filter((t) => t.verification_status === 'UNDER_REVIEW' || t.verification_status === 'SUBMITTED').length,
    drafts: therapists.filter((t) => t.verification_status === 'DRAFT' || t.verification_status === 'INACTIVE').length,
  };

  const filtered = therapists.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      t.full_name.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.areas_of_practice.some((a) => a.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'ALL' || t.verification_status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2420]">Therapists & Verification</h1>
          <p className="text-xs text-[#54635B] mt-1">
            Review professional credentials, enforce licensing governance, and onboard licensed practitioners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTherapists}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsOnboardingOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Onboard Therapist
          </Button>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap gap-2 pt-1">
        {[
          { id: 'ALL', label: 'All Roster', count: counts.all },
          { id: 'VERIFIED', label: 'Verified & Published', count: counts.verified },
          { id: 'UNDER_REVIEW', label: 'Under Review', count: counts.underReview },
          { id: 'DRAFT', label: 'Drafts / Incomplete', count: counts.drafts },
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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E3DED6] shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-[#78867E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search practitioners by name, title, or clinical focus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
          />
        </div>
      </div>

      {/* Roster Table */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#54635B] bg-white rounded-2xl border border-[#E3DED6]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2D5A46] mb-2" />
          <p className="text-xs font-medium">Loading practitioner credential records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#E3DED6] p-8 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FBF9F5] text-[#78867E] flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-[#1C2420]">No therapists found</p>
          <p className="text-xs text-[#78867E] mt-1">Try adjusting your search criteria or status filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E3DED6] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF9F5] text-[#78867E] uppercase font-bold border-b border-[#E3DED6]">
                <tr>
                  <th className="py-3.5 px-4">Practitioner</th>
                  <th className="py-3.5 px-4">Experience & Languages</th>
                  <th className="py-3.5 px-4">Clinical Focus</th>
                  <th className="py-3.5 px-4">Formats</th>
                  <th className="py-3.5 px-4">Governance</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE9E1]">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-[#FBF9F5] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#E3DED6] shrink-0">
                          <ResponsiveImage
                            src={t.profile_photo_url || ''}
                            alt={t.full_name}
                            fallbackType="person"
                            aspectRatio="square"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-[#1C2420] text-sm">{t.full_name}</div>
                          <div className="text-[11px] text-[#54635B]">{t.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1C2420]">
                        {t.years_experience} Years Practice
                      </div>
                      <div className="text-[11px] text-[#78867E] flex items-center gap-1 mt-0.5">
                        <Languages className="w-3 h-3 text-[#2D5A46]" />
                        <span>{t.languages.join(', ')}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {t.areas_of_practice.slice(0, 3).map((area, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-[#F4EFEA] text-[#1C2420] text-[10px] font-medium"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#54635B]">
                        {t.supports_online && (
                          <span className="flex items-center gap-1 text-[#2D5A46] font-medium">
                            <Video className="w-3 h-3" /> Online
                          </span>
                        )}
                        {t.supports_in_person && (
                          <span className="flex items-center gap-1 text-[#9E5D43] font-medium">
                            <MapPin className="w-3 h-3" /> Kilimani
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={t.verification_status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedTherapist(t)}
                          className="p-1.5 text-[#54635B] hover:text-[#1C2420] hover:bg-[#F4EFEA] rounded-lg cursor-pointer transition-colors"
                          title="View Full Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditProfile(t)}
                          className="p-1.5 text-[#54635B] hover:text-[#1C2420] hover:bg-[#F4EFEA] rounded-lg cursor-pointer transition-colors"
                          title="Edit profile"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setVerifyingTherapist(t);
                            setNewStatus(t.verification_status === 'VERIFIED' ? 'SUSPENDED' : 'VERIFIED');
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-[#E3DED6] bg-white text-[#1C2420] hover:bg-[#F4EFEA] cursor-pointer transition-colors"
                        >
                          Governance
                        </button>
                        <button
                          onClick={() => setDeletingTherapist(t)}
                          className="p-1.5 text-[#A63B30] hover:text-red-700 hover:bg-[#FCECE9] rounded-lg cursor-pointer transition-colors"
                          title="Archive / Delete Practitioner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit profile modal — incomplete records remain unpublished until governance approval. */}
      {editingTherapist && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-[#E3DED6] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E1]">
              <div><h3 className="text-lg font-bold text-[#1C2420]">Edit practitioner profile</h3><p className="text-xs text-[#54635B]">Save details first, then use Governance to publish after review.</p></div>
              <button type="button" onClick={() => setEditingTherapist(null)} className="p-1 text-[#78867E] hover:text-[#1C2420]"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="font-bold text-[#1C2420]">Full name<input required value={editProfile.full_name} onChange={(e) => setEditProfile({ ...editProfile, full_name: e.target.value })} className="mt-1 w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2" /></label>
              <label className="font-bold text-[#1C2420]">Professional title<input value={editProfile.title} onChange={(e) => setEditProfile({ ...editProfile, title: e.target.value })} className="mt-1 w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2" /></label>
              <label className="font-bold text-[#1C2420]">Years of experience<input type="number" min="0" max="80" value={editProfile.years_experience} onChange={(e) => setEditProfile({ ...editProfile, years_experience: Number(e.target.value) })} className="mt-1 w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2" /></label>
              <label className="font-bold text-[#1C2420]">Profile photo URL<input type="url" value={editProfile.profile_photo_url} onChange={(e) => setEditProfile({ ...editProfile, profile_photo_url: e.target.value })} className="mt-1 w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2" /></label>
            </div>
            <label className="block text-xs font-bold text-[#1C2420]">Biography<textarea rows={4} value={editProfile.bio} onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })} className="mt-1 w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl p-3" /></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <label className="font-bold text-[#1C2420]">Languages (comma separated)<input value={editProfile.languages} onChange={(e) => setEditProfile({ ...editProfile, languages: e.target.value })} className="mt-1 w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2" /></label>
              <label className="font-bold text-[#1C2420]">Specialties (comma separated)<input value={editProfile.areas_of_practice} onChange={(e) => setEditProfile({ ...editProfile, areas_of_practice: e.target.value })} className="mt-1 w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2" /></label>
            </div>
            <div className="flex gap-5 text-xs text-[#1C2420]"><label className="flex items-center gap-2"><input type="checkbox" checked={editProfile.supports_online} onChange={(e) => setEditProfile({ ...editProfile, supports_online: e.target.checked })} /> Online</label><label className="flex items-center gap-2"><input type="checkbox" checked={editProfile.supports_in_person} onChange={(e) => setEditProfile({ ...editProfile, supports_in_person: e.target.checked })} /> In person</label></div>
            <div className="pt-2 flex justify-end gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setEditingTherapist(null)}>Cancel</Button><Button type="submit" variant="primary" size="sm" isLoading={isSavingProfile}>Save profile</Button></div>
          </form>
        </div>
      )}

      {/* Verification State Modal */}
      {verifyingTherapist && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E3DED6] shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E1]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2D5A46]" />
                <h3 className="text-base font-bold text-[#1C2420]">Update Governance Status</h3>
              </div>
              <button
                onClick={() => setVerifyingTherapist(null)}
                className="p-1 text-[#78867E] hover:text-[#1C2420]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#54635B]">
              Practitioner: <strong>{verifyingTherapist.full_name}</strong> ({verifyingTherapist.title})
            </p>

            <form onSubmit={handleUpdateVerification} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1C2420] mb-1.5">
                  Verification Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                >
                  <option value="VERIFIED">VERIFIED (Active on Public Booking Directory)</option>
                  <option value="APPROVED">APPROVED (Credentials Confirmed, Ready to Activate)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Submitted Profile Under Clinical Review)</option>
                  <option value="SUBMITTED">SUBMITTED (Initial Details Received)</option>
                  <option value="DRAFT">DRAFT (Incomplete Profile - Pending Info)</option>
                  <option value="INACTIVE">INACTIVE (Not Available for Public Booking)</option>
                  <option value="SUSPENDED">SUSPENDED (Temporarily Hidden from Booking)</option>
                  <option value="REJECTED">REJECTED (Non-Compliant)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1C2420] mb-1.5">
                  Administrative Governance Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g., Verified valid license with Kenya Psychological Association (KPA)..."
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl p-3 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setVerifyingTherapist(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isUpdatingStatus}
                >
                  Save Governance Change
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Therapist Profile Dossier Modal */}
      {selectedTherapist && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E3DED6] shadow-2xl space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#EDE9E1]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#E3DED6] shrink-0">
                  <ResponsiveImage
                    src={selectedTherapist.profile_photo_url || ''}
                    alt={selectedTherapist.full_name}
                    fallbackType="person"
                    aspectRatio="square"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C2420]">{selectedTherapist.full_name}</h3>
                  <div className="text-xs text-[#54635B]">{selectedTherapist.title}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTherapist(null)}
                className="p-1 text-[#78867E] hover:text-[#1C2420]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#FBF9F5] rounded-xl border border-[#EDE9E1]">
                <span className="text-[#78867E]">Verification Status:</span>
                <StatusBadge status={selectedTherapist.verification_status} />
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#78867E] uppercase block mb-1">
                  Clinical Biography
                </span>
                <p className="text-[#54635B] leading-relaxed bg-[#FBF9F5] p-3 rounded-xl border border-[#EDE9E1]">
                  {selectedTherapist.bio}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FBF9F5] rounded-xl border border-[#EDE9E1]">
                <div>
                  <span className="text-[#78867E]">Years Experience:</span>
                  <div className="font-bold text-[#1C2420]">{selectedTherapist.years_experience} Years</div>
                </div>
                <div>
                  <span className="text-[#78867E]">Consultation Languages:</span>
                  <div className="font-bold text-[#1C2420]">{selectedTherapist.languages.join(', ')}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#78867E] uppercase block mb-1.5">
                  Specialist Practice Areas
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTherapist.areas_of_practice.map((area, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#EBF2EE] text-[#2D5A46] font-semibold text-xs"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {selectedTherapist.internal_admin_notes && (
                <div className="p-3 bg-[#FAF2E4] rounded-xl border border-[#D6A54A]/30">
                  <span className="text-[10px] font-bold text-[#9E6B1F] uppercase block mb-1">
                    Internal Clinical Board Notes
                  </span>
                  <p className="text-xs text-[#1C2420] italic">
                    "{selectedTherapist.internal_admin_notes}"
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#EDE9E1] flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedTherapist(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {isOnboardingOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-[#E3DED6] shadow-2xl space-y-5 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E1]">
              <div>
                <h3 className="text-lg font-bold text-[#1C2420]">Onboard Clinical Practitioner</h3>
                <p className="text-xs text-[#54635B]">
                  Register a new licensed psychologist or therapist into the Be Sawa care directory.
                </p>
              </div>
              <button
                onClick={() => setIsOnboardingOpen(false)}
                className="p-1 text-[#78867E] hover:text-[#1C2420]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1C2420] mb-1">
                    Full Practitioner Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Dr. Achieng Ochieng, PhD"
                    value={newTherapistData.full_name}
                    onChange={(e) => setNewTherapistData({ ...newTherapistData, full_name: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1C2420] mb-1">
                    Professional Clinical Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTherapistData.title}
                    onChange={(e) => setNewTherapistData({ ...newTherapistData, title: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1C2420] mb-1">
                  Clinical Bio & Therapeutic Philosophy
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe educational background, clinical approach (e.g. CBT, psychodynamic, narrative), and passion..."
                  value={newTherapistData.bio}
                  onChange={(e) => setNewTherapistData({ ...newTherapistData, bio: e.target.value })}
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl p-3 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#1C2420] mb-1">
                    Years of Clinical Experience
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newTherapistData.years_experience}
                    onChange={(e) => setNewTherapistData({ ...newTherapistData, years_experience: Number(e.target.value) })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1C2420] mb-1">
                    Languages Spoken (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newTherapistData.languages}
                    onChange={(e) => setNewTherapistData({ ...newTherapistData, languages: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1C2420] mb-1">
                  Specialties / Areas of Practice (comma separated)
                </label>
                <input
                  type="text"
                  value={newTherapistData.areas_of_practice}
                  onChange={(e) => setNewTherapistData({ ...newTherapistData, areas_of_practice: e.target.value })}
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1C2420] mb-1">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  value={newTherapistData.profile_photo_url}
                  onChange={(e) => setNewTherapistData({ ...newTherapistData, profile_photo_url: e.target.value })}
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOnboardingOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isOnboardingSubmitting}
                >
                  Complete Onboarding
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Archive Practitioner Confirmation Modal */}
      {deletingTherapist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E3DED6] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-[#A63B30]">
              <div className="w-10 h-10 rounded-2xl bg-[#FCECE9] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#A63B30]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1C2420]">Archive Practitioner?</h3>
                <p className="text-xs text-[#78867E]">Remove from clinical directory.</p>
              </div>
            </div>
            <p className="text-xs text-[#54635B] bg-[#FBF9F5] p-3 rounded-xl border border-[#EDE9E1]">
              Are you sure you want to remove <strong className="text-[#1C2420]">{deletingTherapist.full_name}</strong>? Existing historical session ledgers and settlements will be preserved.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeletingTherapist(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteTherapist}
                isLoading={isDeletingTherapist}
                className="bg-[#A63B30] hover:bg-red-700 text-white border-transparent"
              >
                Yes, Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
