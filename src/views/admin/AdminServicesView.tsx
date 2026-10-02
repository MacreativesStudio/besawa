import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Edit2,
  Clock,
  Video,
  MapPin,
  Package as PackageIcon,
  RefreshCw,
  X,
  Tag,
  DollarSign,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { api } from '../../api';
import { Service, ServiceCategory, Package } from '../../types';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const AdminServicesView: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'services' | 'packages'>('services');

  // Services State
  const [services, setServices] = useState<(Service & { assigned_therapist_count?: number })[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [serviceSearch, setServiceSearch] = useState('');

  // Packages State
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);

  // Edit / Add Service Modal
  const [editingService, setEditingService] = useState<(Partial<Service> & { isNew?: boolean }) | null>(null);
  const [isSavingService, setIsSavingService] = useState(false);

  // Edit / Add Package Modal
  const [editingPackage, setEditingPackage] = useState<(Partial<Package> & { isNew?: boolean }) | null>(null);
  const [isSavingPackage, setIsSavingPackage] = useState(false);

  const fetchServices = () => {
    setIsLoadingServices(true);
    api
      .getAdminServices()
      .then((res) => {
        setServices(res.services);
        setCategories(res.categories);
      })
      .catch((err) => showToast(err.message || 'Failed loading services.', 'error'))
      .finally(() => setIsLoadingServices(false));
  };

  const fetchPackages = () => {
    setIsLoadingPackages(true);
    api
      .getAdminPackages()
      .then((res) => setPackages(res.packages))
      .catch((err) => showToast(err.message || 'Failed loading packages.', 'error'))
      .finally(() => setIsLoadingPackages(false));
  };

  useEffect(() => {
    fetchServices();
    fetchPackages();
  }, []);

  // Toggle Service Active Status
  const handleToggleServiceActive = async (service: Service) => {
    const newStatus = !service.is_active;
    try {
      await api.updateService(service.id, { is_active: newStatus });
      showToast(`${service.name} is now ${newStatus ? 'Active' : 'Inactive'}.`, 'success');
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_active: newStatus } : s))
      );
    } catch (err: any) {
      showToast(err.message || 'Failed updating status.', 'error');
    }
  };

  // Toggle Package Active Status
  const handleTogglePackageActive = async (pkg: Package) => {
    const newStatus = !pkg.is_active;
    try {
      await api.updatePackage(pkg.id, { is_active: newStatus });
      showToast(`${pkg.name} is now ${newStatus ? 'Active' : 'Inactive'}.`, 'success');
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, is_active: newStatus } : p))
      );
    } catch (err: any) {
      showToast(err.message || 'Failed updating package status.', 'error');
    }
  };

  // Save Service (Create or Update)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    if (!editingService.name || !editingService.price) {
      showToast('Please provide both service name and price.', 'error');
      return;
    }

    setIsSavingService(true);
    try {
      if (editingService.isNew) {
        await api.createService({
          name: editingService.name,
          category_id: editingService.category_id || (categories[0]?.id ?? null),
          description: editingService.description || '',
          duration_minutes: Number(editingService.duration_minutes) || 50,
          price: Number(editingService.price),
          delivery_mode: editingService.delivery_mode || 'BOTH',
          booking_instructions: editingService.booking_instructions || '',
        });
        showToast('New counselling service created successfully.', 'success');
      } else if (editingService.id) {
        await api.updateService(editingService.id, {
          name: editingService.name,
          category_id: editingService.category_id,
          description: editingService.description,
          duration_minutes: Number(editingService.duration_minutes),
          price: Number(editingService.price),
          delivery_mode: editingService.delivery_mode,
          booking_instructions: editingService.booking_instructions,
        });
        showToast('Service updated successfully.', 'success');
      }
      setEditingService(null);
      fetchServices();
    } catch (err: any) {
      showToast(err.message || 'Failed saving service.', 'error');
    } finally {
      setIsSavingService(false);
    }
  };

  // Save Package (Create or Update)
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;

    if (!editingPackage.name || !editingPackage.price || !editingPackage.number_of_sessions) {
      showToast('Name, price, and number of sessions are required.', 'error');
      return;
    }

    setIsSavingPackage(true);
    try {
      if (editingPackage.isNew) {
        await api.createPackage({
          name: editingPackage.name,
          description: editingPackage.description || '',
          number_of_sessions: Number(editingPackage.number_of_sessions),
          price: Number(editingPackage.price),
          validity_days: Number(editingPackage.validity_days) || 60,
        });
        showToast('New care package created successfully.', 'success');
      } else if (editingPackage.id) {
        await api.updatePackage(editingPackage.id, {
          name: editingPackage.name,
          description: editingPackage.description,
          number_of_sessions: Number(editingPackage.number_of_sessions),
          price: Number(editingPackage.price),
          validity_days: Number(editingPackage.validity_days),
        });
        showToast('Package updated successfully.', 'success');
      }
      setEditingPackage(null);
      fetchPackages();
    } catch (err: any) {
      showToast(err.message || 'Failed saving package.', 'error');
    } finally {
      setIsSavingPackage(false);
    }
  };

  const filteredServices = services.filter((s) => {
    const q = serviceSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.category_name && s.category_name.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2420]">Services &amp; Packages Management</h1>
          <p className="text-xs text-[#54635B] mt-1">
            Configure clinical therapy catalog, session durations, pricing in KES, delivery modes, and multi-session wellness pathways.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'services' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingService({
                  isNew: true,
                  name: '',
                  category_id: categories[0]?.id || '',
                  duration_minutes: 50,
                  price: 1500,
                  currency: 'KES',
                  delivery_mode: 'BOTH',
                  description: '',
                  booking_instructions: 'Please find a quiet, private space where you feel comfortable speaking freely.',
                })
              }
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add New Service
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingPackage({
                  isNew: true,
                  name: '',
                  number_of_sessions: 4,
                  price: 5500,
                  currency: 'KES',
                  validity_days: 60,
                  description: 'A focused sequences of sessions designed for meaningful, sustainable emotional progress.',
                })
              }
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Package
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchServices();
              fetchPackages();
            }}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E3DED6] pb-1">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'services'
              ? 'bg-white text-[#2D5A46] border-t-2 border-[#2D5A46] shadow-2xs font-extrabold'
              : 'text-[#54635B] hover:text-[#1C2420]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Therapy Offerings ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'packages'
              ? 'bg-white text-[#2D5A46] border-t-2 border-[#2D5A46] shadow-2xs font-extrabold'
              : 'text-[#54635B] hover:text-[#1C2420]'
          }`}
        >
          <PackageIcon className="w-4 h-4" />
          <span>Care Packages ({packages.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SERVICES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[#78867E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services by title or category..."
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              className="w-full bg-white border border-[#E3DED6] rounded-xl pl-10 pr-4 py-2 text-xs text-[#1C2420] placeholder-[#78867E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
            />
          </div>

          {isLoadingServices ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#54635B]">
              <Loader2 className="w-8 h-8 animate-spin text-[#2D5A46] mb-2" />
              <p className="text-xs">Loading clinical services catalog...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E3DED6] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FBF9F5] border-b border-[#EDE9E1] text-[#78867E] uppercase font-bold text-[10px] tracking-wider">
                      <th className="p-3.5 pl-5">Service Title &amp; Description</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Duration</th>
                      <th className="p-3.5">Delivery Mode</th>
                      <th className="p-3.5">Session Fee</th>
                      <th className="p-3.5">Therapists</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 pr-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDE9E1]">
                    {filteredServices.map((s) => (
                      <tr key={s.id} className="hover:bg-[#FBF9F5]/70 transition-colors">
                        <td className="p-3.5 pl-5 max-w-xs">
                          <div className="font-bold text-[#1C2420] text-sm">{s.name}</div>
                          <div className="text-[#54635B] text-[11px] line-clamp-2 mt-0.5">
                            {s.description}
                          </div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF2EE] text-[#2D5A46] border border-[#2D5A46]/20">
                            {s.category_name}
                          </span>
                        </td>

                        <td className="p-3.5 whitespace-nowrap text-[#54635B]">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-[#78867E]" />
                            {s.duration_minutes} Mins
                          </span>
                        </td>

                        <td className="p-3.5 whitespace-nowrap text-[#54635B]">
                          {s.delivery_mode === 'ONLINE' ? (
                            <span className="inline-flex items-center gap-1 text-[#2D5A46]">
                              <Video className="w-3.5 h-3.5" /> Online
                            </span>
                          ) : s.delivery_mode === 'IN_PERSON' ? (
                            <span className="inline-flex items-center gap-1 text-[#9E5D43]">
                              <MapPin className="w-3.5 h-3.5" /> In-Person
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#286E47]">
                              Both (Video &amp; In-Person)
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 whitespace-nowrap font-mono font-bold text-[#2D5A46] text-sm">
                          KES {s.price.toLocaleString()}
                        </td>

                        <td className="p-3.5 whitespace-nowrap text-[#54635B]">
                          {s.assigned_therapist_count ?? 1} assigned
                        </td>

                        <td className="p-3.5 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleServiceActive(s)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                              s.is_active
                                ? 'bg-[#E8F3ED] text-[#286E47] border border-[#286E47]/20 hover:bg-[#D4EBDD]'
                                : 'bg-[#FCECE9] text-[#A63B30] border border-[#A63B30]/20 hover:bg-[#F8D8D3]'
                            }`}
                          >
                            {s.is_active ? 'Active' : 'Disabled'}
                          </button>
                        </td>

                        <td className="p-3.5 pr-5 whitespace-nowrap text-right">
                          <button
                            onClick={() => setEditingService(s)}
                            className="p-1.5 text-[#54635B] hover:text-[#2D5A46] hover:bg-[#EBF2EE] rounded-lg transition-colors cursor-pointer"
                            title="Edit Service"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PACKAGES TAB */}
      {/* ========================================================================= */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          {isLoadingPackages ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#54635B]">
              <Loader2 className="w-8 h-8 animate-spin text-[#2D5A46] mb-2" />
              <p className="text-xs">Loading care packages...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {packages.map((pkg) => {
                const perSessionRate = Math.round(pkg.price / (pkg.number_of_sessions || 1));
                return (
                  <div
                    key={pkg.id}
                    className={`bg-white rounded-3xl p-6 border shadow-xs flex flex-col justify-between transition-all ${
                      pkg.is_active
                        ? 'border-[#E3DED6] hover:border-[#2D5A46]/40'
                        : 'border-[#EDE9E1] opacity-75 bg-[#FAF9F7]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#EDE9E1] mb-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E6B1F] bg-[#FAF2E4] px-2.5 py-0.5 rounded-full border border-[#D6A54A]/30">
                          {pkg.number_of_sessions} Sessions Bundle
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTogglePackageActive(pkg)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                            pkg.is_active
                              ? 'bg-[#E8F3ED] text-[#286E47] border border-[#286E47]/20'
                              : 'bg-[#FCECE9] text-[#A63B30] border border-[#A63B30]/20'
                          }`}
                        >
                          {pkg.is_active ? 'Active' : 'Disabled'}
                        </button>
                      </div>

                      <h3 className="text-lg font-bold text-[#1C2420]">{pkg.name}</h3>
                      <p className="text-xs text-[#54635B] mt-1.5 leading-relaxed line-clamp-3">
                        {pkg.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-[#EDE9E1] space-y-1.5 text-xs text-[#54635B]">
                        <div className="flex items-center justify-between">
                          <span>Total Bundle Price:</span>
                          <span className="font-mono font-black text-[#2D5A46] text-base">
                            KES {pkg.price.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Effective Rate:</span>
                          <span className="font-semibold text-[#1C2420]">
                            KES {perSessionRate.toLocaleString()} / session
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Validity Window:</span>
                          <span className="font-medium text-[#78867E]">
                            {pkg.validity_days || 60} Days from Purchase
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#EDE9E1] flex items-center justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPackage(pkg)}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        Edit Package
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT / CREATE SERVICE MODAL */}
      {/* ========================================================================= */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E3DED6] shadow-2xl space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E1]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C2420]">
                    {editingService.isNew ? 'Create New Service' : 'Edit Therapy Service'}
                  </h3>
                  <p className="text-xs text-[#54635B]">Configure clinical pricing and parameters</p>
                </div>
              </div>
              <button
                onClick={() => setEditingService(null)}
                className="p-1.5 text-[#78867E] hover:text-[#1C2420] rounded-lg hover:bg-[#F4EFEA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={editingService.name || ''}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  placeholder="e.g. Individual Adult Therapy & Intake"
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Category</label>
                  <select
                    value={editingService.category_id || (categories[0]?.id ?? '')}
                    onChange={(e) => setEditingService({ ...editingService, category_id: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    step={5}
                    value={editingService.duration_minutes || 50}
                    onChange={(e) =>
                      setEditingService({ ...editingService, duration_minutes: Number(e.target.value) })
                    }
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Session Price (KES) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={100}
                    value={editingService.price || 1500}
                    onChange={(e) =>
                      setEditingService({ ...editingService, price: Number(e.target.value) })
                    }
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] font-mono focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Delivery Format</label>
                  <select
                    value={editingService.delivery_mode || 'BOTH'}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        delivery_mode: e.target.value as any,
                      })
                    }
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  >
                    <option value="BOTH">Both (Video &amp; Kilimani)</option>
                    <option value="ONLINE">Online Telehealth Only</option>
                    <option value="IN_PERSON">In-Person Rooms Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">Clinical Description</label>
                <textarea
                  rows={3}
                  value={editingService.description || ''}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  placeholder="Describe the therapeutic scope and objectives..."
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl p-3 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">
                  Client Booking Instructions
                </label>
                <textarea
                  rows={2}
                  value={editingService.booking_instructions || ''}
                  onChange={(e) =>
                    setEditingService({ ...editingService, booking_instructions: e.target.value })
                  }
                  placeholder="Instructions sent to client upon appointment booking..."
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl p-3 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingService(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSavingService}
                >
                  {editingService.isNew ? 'Create Service' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT / CREATE PACKAGE MODAL */}
      {/* ========================================================================= */}
      {editingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#E3DED6] shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E1]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#FAF2E4] text-[#9E6B1F] flex items-center justify-center">
                  <PackageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C2420]">
                    {editingPackage.isNew ? 'Create Care Package' : 'Edit Care Package'}
                  </h3>
                  <p className="text-xs text-[#54635B]">Bundled multi-session pathway</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPackage(null)}
                className="p-1.5 text-[#78867E] hover:text-[#1C2420] rounded-lg hover:bg-[#F4EFEA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">Package Title *</label>
                <input
                  type="text"
                  required
                  value={editingPackage.name || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                  placeholder="e.g. Healing Foundations (4 Sessions)"
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Number of Sessions *</label>
                  <input
                    type="number"
                    required
                    min={2}
                    max={50}
                    value={editingPackage.number_of_sessions || 4}
                    onChange={(e) =>
                      setEditingPackage({ ...editingPackage, number_of_sessions: Number(e.target.value) })
                    }
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Validity (Days)</label>
                  <input
                    type="number"
                    min={30}
                    max={365}
                    value={editingPackage.validity_days || 60}
                    onChange={(e) =>
                      setEditingPackage({ ...editingPackage, validity_days: Number(e.target.value) })
                    }
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">Total Bundle Price (KES) *</label>
                <input
                  type="number"
                  required
                  min={100}
                  step={500}
                  value={editingPackage.price || 5500}
                  onChange={(e) =>
                    setEditingPackage({ ...editingPackage, price: Number(e.target.value) })
                  }
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs text-[#1C2420] font-mono focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">Pathway Description</label>
                <textarea
                  rows={3}
                  value={editingPackage.description || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                  placeholder="Describe who this care pathway is tailored for..."
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl p-3 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPackage(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSavingPackage}
                >
                  {editingPackage.isNew ? 'Create Package' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
