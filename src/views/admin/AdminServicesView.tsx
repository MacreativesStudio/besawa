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
  Trash2,
  HelpCircle,
  Quote,
  MessageSquare,
  Check,
  AlertTriangle,
  Mail,
  Phone,
} from 'lucide-react';
import { api } from '../../api';
import { Service, ServiceCategory, Package, FAQ, Testimonial, ContactMessage } from '../../types';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';

export const AdminServicesView: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'services' | 'packages' | 'faqs' | 'testimonials' | 'inquiries'>('services');

  // Services State
  const [services, setServices] = useState<(Service & { assigned_therapist_count?: number })[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [serviceSearch, setServiceSearch] = useState('');
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [isDeletingService, setIsDeletingService] = useState(false);

  // Packages State
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  const [isDeletingPackage, setIsDeletingPackage] = useState(false);

  // FAQs State
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(false);
  const [editingFaq, setEditingFaq] = useState<(Partial<FAQ> & { isNew?: boolean }) | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<FAQ | null>(null);
  const [isSavingFaq, setIsSavingFaq] = useState(false);
  const [isDeletingFaq, setIsDeletingFaq] = useState(false);

  // Testimonials State
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<(Partial<Testimonial> & { isNew?: boolean }) | null>(null);
  const [deletingTestimonial, setDeletingTestimonial] = useState<Testimonial | null>(null);
  const [isSavingTestimonial, setIsSavingTestimonial] = useState(false);
  const [isDeletingTestimonial, setIsDeletingTestimonial] = useState(false);

  // Contact Inquiries State
  const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [deletingInquiry, setDeletingInquiry] = useState<ContactMessage | null>(null);
  const [isDeletingInquiry, setIsDeletingInquiry] = useState(false);

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

  const fetchFaqs = () => {
    setIsLoadingFaqs(true);
    api
      .getAdminFaqs()
      .then((res) => setFaqs(res.faqs))
      .catch((err) => showToast(err.message || 'Failed loading FAQs.', 'error'))
      .finally(() => setIsLoadingFaqs(false));
  };

  const fetchTestimonials = () => {
    setIsLoadingTestimonials(true);
    api
      .getAdminTestimonials()
      .then((res) => setTestimonials(res.testimonials))
      .catch((err) => showToast(err.message || 'Failed loading testimonials.', 'error'))
      .finally(() => setIsLoadingTestimonials(false));
  };

  const fetchInquiries = () => {
    setIsLoadingInquiries(true);
    api
      .getAdminContactMessages()
      .then((res) => setInquiries(res.messages))
      .catch((err) => showToast(err.message || 'Failed loading inquiries.', 'error'))
      .finally(() => setIsLoadingInquiries(false));
  };

  useEffect(() => {
    fetchServices();
    fetchPackages();
    fetchFaqs();
    fetchTestimonials();
    fetchInquiries();
  }, []);

  // Delete Service
  const handleDeleteService = async () => {
    if (!deletingService) return;
    setIsDeletingService(true);
    try {
      await api.deleteService(deletingService.id);
      showToast(`${deletingService.name} deleted successfully.`, 'success');
      setServices((prev) => prev.filter((s) => s.id !== deletingService.id));
      setDeletingService(null);
    } catch (err: any) {
      showToast(err.message || 'Failed deleting service.', 'error');
    } finally {
      setIsDeletingService(false);
    }
  };

  // Delete Package
  const handleDeletePackage = async () => {
    if (!deletingPackage) return;
    setIsDeletingPackage(true);
    try {
      await api.deletePackage(deletingPackage.id);
      showToast(`${deletingPackage.name} deleted successfully.`, 'success');
      setPackages((prev) => prev.filter((p) => p.id !== deletingPackage.id));
      setDeletingPackage(null);
    } catch (err: any) {
      showToast(err.message || 'Failed deleting package.', 'error');
    } finally {
      setIsDeletingPackage(false);
    }
  };

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

  // Save FAQ (Create or Update)
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq || !editingFaq.question || !editingFaq.answer) {
      showToast('Please provide both question and answer.', 'error');
      return;
    }
    setIsSavingFaq(true);
    try {
      if (editingFaq.isNew) {
        await api.createFaq({
          question: editingFaq.question,
          answer: editingFaq.answer,
          category: editingFaq.category || 'General',
          display_order: Number(editingFaq.display_order) || faqs.length + 1,
          is_published: editingFaq.is_published !== false,
        });
        showToast('FAQ created successfully.', 'success');
      } else if (editingFaq.id) {
        await api.updateFaq(editingFaq.id, {
          question: editingFaq.question,
          answer: editingFaq.answer,
          category: editingFaq.category,
          display_order: Number(editingFaq.display_order),
          is_published: editingFaq.is_published,
        });
        showToast('FAQ updated successfully.', 'success');
      }
      setEditingFaq(null);
      fetchFaqs();
    } catch (err: any) {
      showToast(err.message || 'Failed saving FAQ.', 'error');
    } finally {
      setIsSavingFaq(false);
    }
  };

  // Toggle FAQ Published
  const handleToggleFaqPublished = async (faq: FAQ) => {
    const nextState = !faq.is_published;
    try {
      await api.updateFaq(faq.id, { is_published: nextState });
      showToast(`FAQ is now ${nextState ? 'Published' : 'Hidden'}.`, 'success');
      setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, is_published: nextState } : f)));
    } catch (err: any) {
      showToast(err.message || 'Failed updating FAQ.', 'error');
    }
  };

  // Delete FAQ
  const handleDeleteFaq = async () => {
    if (!deletingFaq) return;
    setIsDeletingFaq(true);
    try {
      await api.deleteFaq(deletingFaq.id);
      showToast('FAQ removed.', 'success');
      setFaqs((prev) => prev.filter((f) => f.id !== deletingFaq.id));
      setDeletingFaq(null);
    } catch (err: any) {
      showToast(err.message || 'Failed deleting FAQ.', 'error');
    } finally {
      setIsDeletingFaq(false);
    }
  };

  // Save Testimonial (Create or Update)
  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial || !editingTestimonial.client_alias || !editingTestimonial.quote) {
      showToast('Please provide client alias and quote.', 'error');
      return;
    }
    setIsSavingTestimonial(true);
    try {
      if (editingTestimonial.isNew) {
        await api.createTestimonial({
          client_alias: editingTestimonial.client_alias,
          quote: editingTestimonial.quote,
          session_category: editingTestimonial.session_category || 'Individual Therapy',
          is_verified: editingTestimonial.is_verified !== false,
          is_published: editingTestimonial.is_published !== false,
        });
        showToast('Testimonial created successfully.', 'success');
      } else if (editingTestimonial.id) {
        await api.updateTestimonial(editingTestimonial.id, {
          client_alias: editingTestimonial.client_alias,
          quote: editingTestimonial.quote,
          session_category: editingTestimonial.session_category,
          is_verified: editingTestimonial.is_verified,
          is_published: editingTestimonial.is_published,
        });
        showToast('Testimonial updated successfully.', 'success');
      }
      setEditingTestimonial(null);
      fetchTestimonials();
    } catch (err: any) {
      showToast(err.message || 'Failed saving testimonial.', 'error');
    } finally {
      setIsSavingTestimonial(false);
    }
  };

  // Toggle Testimonial Published
  const handleToggleTestimonialPublished = async (t: Testimonial) => {
    const nextState = !t.is_published;
    try {
      await api.updateTestimonial(t.id, { is_published: nextState });
      showToast(`Testimonial is now ${nextState ? 'Published' : 'Hidden'}.`, 'success');
      setTestimonials((prev) => prev.map((item) => (item.id === t.id ? { ...item, is_published: nextState } : item)));
    } catch (err: any) {
      showToast(err.message || 'Failed updating testimonial.', 'error');
    }
  };

  // Delete Testimonial
  const handleDeleteTestimonial = async () => {
    if (!deletingTestimonial) return;
    setIsDeletingTestimonial(true);
    try {
      await api.deleteTestimonial(deletingTestimonial.id);
      showToast('Testimonial removed.', 'success');
      setTestimonials((prev) => prev.filter((t) => t.id !== deletingTestimonial.id));
      setDeletingTestimonial(null);
    } catch (err: any) {
      showToast(err.message || 'Failed deleting testimonial.', 'error');
    } finally {
      setIsDeletingTestimonial(false);
    }
  };

  // Toggle Inquiry Resolved
  const handleToggleInquiryResolved = async (msg: ContactMessage) => {
    const nextState = !msg.is_resolved;
    try {
      await api.updateContactMessageStatus(msg.id, nextState);
      showToast(`Inquiry marked as ${nextState ? 'Resolved' : 'Pending'}.`, 'success');
      setInquiries((prev) => prev.map((m) => (m.id === msg.id ? { ...m, is_resolved: nextState } : m)));
    } catch (err: any) {
      showToast(err.message || 'Failed updating inquiry status.', 'error');
    }
  };

  // Delete Inquiry
  const handleDeleteInquiry = async () => {
    if (!deletingInquiry) return;
    setIsDeletingInquiry(true);
    try {
      await api.deleteContactMessage(deletingInquiry.id);
      showToast('Inquiry removed from ledger.', 'success');
      setInquiries((prev) => prev.filter((m) => m.id !== deletingInquiry.id));
      setDeletingInquiry(null);
    } catch (err: any) {
      showToast(err.message || 'Failed deleting inquiry.', 'error');
    } finally {
      setIsDeletingInquiry(false);
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
          <h1 className="text-2xl font-bold text-[#1C2420]">Services, Bundles &amp; Content CMS</h1>
          <p className="text-xs text-[#54635B] mt-1">
            Configure clinical therapy catalog, session pricing in KES, care packages, patient FAQs, testimonials, and client inquiries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'services' && (
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
          )}

          {activeTab === 'packages' && (
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

          {activeTab === 'faqs' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingFaq({
                  isNew: true,
                  question: '',
                  answer: '',
                  category: 'General',
                  display_order: faqs.length + 1,
                  is_published: true,
                })
              }
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add FAQ
            </Button>
          )}

          {activeTab === 'testimonials' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingTestimonial({
                  isNew: true,
                  client_alias: '',
                  quote: '',
                  session_category: 'Individual Therapy',
                  is_verified: true,
                  is_published: true,
                })
              }
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Testimonial
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchServices();
              fetchPackages();
              fetchFaqs();
              fetchTestimonials();
              fetchInquiries();
            }}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E3DED6] pb-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
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
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'packages'
              ? 'bg-white text-[#2D5A46] border-t-2 border-[#2D5A46] shadow-2xs font-extrabold'
              : 'text-[#54635B] hover:text-[#1C2420]'
          }`}
        >
          <PackageIcon className="w-4 h-4" />
          <span>Care Packages ({packages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'faqs'
              ? 'bg-white text-[#2D5A46] border-t-2 border-[#2D5A46] shadow-2xs font-extrabold'
              : 'text-[#54635B] hover:text-[#1C2420]'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>FAQs Knowledgebase ({faqs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('testimonials')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'testimonials'
              ? 'bg-white text-[#2D5A46] border-t-2 border-[#2D5A46] shadow-2xs font-extrabold'
              : 'text-[#54635B] hover:text-[#1C2420]'
          }`}
        >
          <Quote className="w-4 h-4" />
          <span>Testimonials ({testimonials.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'inquiries'
              ? 'bg-white text-[#2D5A46] border-t-2 border-[#2D5A46] shadow-2xs font-extrabold'
              : 'text-[#54635B] hover:text-[#1C2420]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Inquiries &amp; Contact Form ({inquiries.filter((i) => !i.is_resolved).length} Pending)</span>
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
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setEditingService(s)}
                              className="p-1.5 text-[#54635B] hover:text-[#2D5A46] hover:bg-[#EBF2EE] rounded-lg transition-colors cursor-pointer"
                              title="Edit Service"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingService(s)}
                              className="p-1.5 text-[#A63B30] hover:text-red-700 hover:bg-[#FCECE9] rounded-lg transition-colors cursor-pointer"
                              title="Delete Service"
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

                    <div className="pt-4 mt-4 border-t border-[#EDE9E1] flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingPackage(pkg)}
                        className="text-[#A63B30] border-[#F8D8D3] hover:bg-[#FCECE9]"
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        Delete
                      </Button>
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
      {/* 3. FAQS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          {isLoadingFaqs ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#54635B]">
              <Loader2 className="w-8 h-8 animate-spin text-[#2D5A46] mb-2" />
              <p className="text-xs">Loading patient FAQs knowledgebase...</p>
            </div>
          ) : faqs.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E3DED6] shadow-xs">
              <HelpCircle className="w-10 h-10 text-[#78867E] mx-auto mb-3 opacity-60" />
              <h3 className="font-bold text-[#1C2420] text-sm">No FAQs Recorded Yet</h3>
              <p className="text-xs text-[#54635B] mt-1 max-w-sm mx-auto">
                Add frequently asked questions to clarify confidentiality, pricing, booking procedures, and intake requirements.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl p-5 border border-[#E3DED6] shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F4EFEA] text-[#1C2420]">
                        {faq.category || 'General'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleFaqPublished(faq)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                          faq.is_published
                            ? 'bg-[#E8F3ED] text-[#286E47] border border-[#286E47]/20'
                            : 'bg-[#FCECE9] text-[#A63B30] border border-[#A63B30]/20'
                        }`}
                      >
                        {faq.is_published ? 'Published on Public Site' : 'Draft / Hidden'}
                      </button>
                    </div>
                    <h4 className="text-sm font-bold text-[#1C2420]">{faq.question}</h4>
                    <p className="text-xs text-[#54635B] leading-relaxed">{faq.answer}</p>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => setEditingFaq(faq)}
                      className="p-1.5 text-[#54635B] hover:text-[#2D5A46] hover:bg-[#EBF2EE] rounded-lg transition-colors cursor-pointer"
                      title="Edit FAQ"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingFaq(faq)}
                      className="p-1.5 text-[#A63B30] hover:text-red-700 hover:bg-[#FCECE9] rounded-lg transition-colors cursor-pointer"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TESTIMONIALS TAB */}
      {/* ========================================================================= */}
      {activeTab === 'testimonials' && (
        <div className="space-y-4">
          {isLoadingTestimonials ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#54635B]">
              <Loader2 className="w-8 h-8 animate-spin text-[#2D5A46] mb-2" />
              <p className="text-xs">Loading client testimonials...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E3DED6] shadow-xs">
              <Quote className="w-10 h-10 text-[#78867E] mx-auto mb-3 opacity-60" />
              <h3 className="font-bold text-[#1C2420] text-sm">No Testimonials Recorded</h3>
              <p className="text-xs text-[#54635B] mt-1 max-w-sm mx-auto">
                Publish anonymous, consensual client feedback to build patient trust and evidence-based therapeutic credibility.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-3xl p-5 border border-[#E3DED6] shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF2E4] text-[#9E6B1F]">
                        {t.session_category || 'Individual Therapy'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleTestimonialPublished(t)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                          t.is_published
                            ? 'bg-[#E8F3ED] text-[#286E47] border border-[#286E47]/20'
                            : 'bg-[#FCECE9] text-[#A63B30] border border-[#A63B30]/20'
                        }`}
                      >
                        {t.is_published ? 'Published' : 'Hidden'}
                      </button>
                    </div>

                    <p className="text-xs text-[#1C2420] italic leading-relaxed">
                      "{t.quote}"
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs text-[#54635B] border-t border-[#EDE9E1]">
                      <div className="font-bold text-[#1C2420]">{t.client_alias}</div>
                      {t.is_verified && (
                        <span className="text-[10px] font-semibold text-[#2D5A46] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#2D5A46]" /> Verified Care
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#EDE9E1] flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setEditingTestimonial(t)}
                      className="p-1.5 text-[#54635B] hover:text-[#2D5A46] hover:bg-[#EBF2EE] rounded-lg transition-colors cursor-pointer"
                      title="Edit Testimonial"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingTestimonial(t)}
                      className="p-1.5 text-[#A63B30] hover:text-red-700 hover:bg-[#FCECE9] rounded-lg transition-colors cursor-pointer"
                      title="Delete Testimonial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. INQUIRIES & CONTACT FORM TAB */}
      {/* ========================================================================= */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {isLoadingInquiries ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#54635B]">
              <Loader2 className="w-8 h-8 animate-spin text-[#2D5A46] mb-2" />
              <p className="text-xs">Loading contact inquiries...</p>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E3DED6] shadow-xs">
              <MessageSquare className="w-10 h-10 text-[#78867E] mx-auto mb-3 opacity-60" />
              <h3 className="font-bold text-[#1C2420] text-sm">No Inquiries Submitted</h3>
              <p className="text-xs text-[#54635B] mt-1 max-w-sm mx-auto">
                Prospective client inquiries submitted via the public contact form appear here for administrative triage and response.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((msg) => {
                const cleanPhone = (msg.phone || '').replace(/[^0-9]/g, '');
                const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('0') ? '254' + cleanPhone.slice(1) : cleanPhone}` : null;
                return (
                  <div
                    key={msg.id}
                    className={`bg-white rounded-2xl p-5 border shadow-xs transition-all ${
                      msg.is_resolved ? 'border-[#EDE9E1] opacity-75' : 'border-[#2D5A46]/30 bg-[#FDFBF7]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EDE9E1]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${msg.is_resolved ? 'bg-slate-300' : 'bg-amber-500 animate-pulse'}`} />
                        <h4 className="text-sm font-bold text-[#1C2420]">{msg.name}</h4>
                        <span className="text-xs text-[#78867E]">({msg.subject || 'General Inquiry'})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#78867E]">
                          {new Date(msg.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleInquiryResolved(msg)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                            msg.is_resolved
                              ? 'bg-[#E8F3ED] text-[#286E47] border border-[#286E47]/20 hover:bg-[#D4EBDD]'
                              : 'bg-[#FAF2E4] text-[#9E6B1F] border border-[#D6A54A]/30 hover:bg-[#F5E6CC]'
                          }`}
                        >
                          {msg.is_resolved ? 'Resolved ✓' : 'Mark as Handled'}
                        </button>
                      </div>
                    </div>

                    <div className="py-3 text-xs text-[#1C2420] leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </div>

                    <div className="pt-3 border-t border-[#EDE9E1] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-3 text-[#54635B]">
                        <a
                          href={`mailto:${msg.email}?subject=Regarding your Be Sawa Inquiry`}
                          className="flex items-center gap-1 hover:text-[#2D5A46] font-medium"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>{msg.email}</span>
                        </a>
                        {msg.phone && (
                          <a href={`tel:${msg.phone}`} className="flex items-center gap-1 hover:text-[#2D5A46] font-medium">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{msg.phone}</span>
                          </a>
                        )}
                        {waLink && (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[#2D5A46] hover:underline font-semibold"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>WhatsApp Care Dispatch</span>
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => setDeletingInquiry(msg)}
                        className="p-1.5 text-[#A63B30] hover:text-red-700 hover:bg-[#FCECE9] rounded-lg transition-colors cursor-pointer"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

      {/* ========================================================================= */}
      {/* DELETE SERVICE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E3DED6] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-[#A63B30]">
              <div className="w-10 h-10 rounded-2xl bg-[#FCECE9] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#A63B30]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1C2420]">Delete Therapy Service?</h3>
                <p className="text-xs text-[#78867E]">This will remove it from the catalog.</p>
              </div>
            </div>
            <p className="text-xs text-[#54635B] bg-[#FBF9F5] p-3 rounded-xl border border-[#EDE9E1]">
              Are you sure you want to delete <strong className="text-[#1C2420]">"{deletingService.name}"</strong>? Existing completed bookings will remain historically preserved.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeletingService(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteService}
                isLoading={isDeletingService}
                className="bg-[#A63B30] hover:bg-red-700 text-white border-transparent"
              >
                Yes, Delete Service
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE PACKAGE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E3DED6] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-[#A63B30]">
              <div className="w-10 h-10 rounded-2xl bg-[#FCECE9] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#A63B30]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1C2420]">Delete Care Package?</h3>
                <p className="text-xs text-[#78867E]">Multi-session bundle will be retired.</p>
              </div>
            </div>
            <p className="text-xs text-[#54635B] bg-[#FBF9F5] p-3 rounded-xl border border-[#EDE9E1]">
              Are you sure you want to delete <strong className="text-[#1C2420]">"{deletingPackage.name}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeletingPackage(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeletePackage}
                isLoading={isDeletingPackage}
                className="bg-[#A63B30] hover:bg-red-700 text-white border-transparent"
              >
                Yes, Delete Package
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT / CREATE FAQ MODAL */}
      {/* ========================================================================= */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E3DED6] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E1]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C2420]">
                    {editingFaq.isNew ? 'Create Patient FAQ' : 'Edit FAQ'}
                  </h3>
                  <p className="text-xs text-[#54635B]">Help patients understand Be Sawa's care model</p>
                </div>
              </div>
              <button
                onClick={() => setEditingFaq(null)}
                className="p-1.5 text-[#78867E] hover:text-[#1C2420] rounded-lg hover:bg-[#F4EFEA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">Question *</label>
                <input
                  type="text"
                  required
                  value={editingFaq.question || ''}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  placeholder="e.g. How does confidential online counselling work?"
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">Answer *</label>
                <textarea
                  rows={4}
                  required
                  value={editingFaq.answer || ''}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  placeholder="Provide a warm, reassuring, and clinically clear response..."
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl p-3 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Category</label>
                  <select
                    value={editingFaq.category || 'General'}
                    onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Confidentiality">Confidentiality & Ethics</option>
                    <option value="Booking & Rates">Booking & Rates</option>
                    <option value="In-Person Sanctuary">In-Person Sanctuary</option>
                    <option value="Telehealth">Online Telehealth</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1C2420] mb-1">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={editingFaq.display_order || 1}
                    onChange={(e) => setEditingFaq({ ...editingFaq, display_order: Number(e.target.value) })}
                    className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="faq_is_published"
                  checked={editingFaq.is_published !== false}
                  onChange={(e) => setEditingFaq({ ...editingFaq, is_published: e.target.checked })}
                  className="rounded border-[#E3DED6] text-[#2D5A46] focus:ring-[#2D5A46]"
                />
                <label htmlFor="faq_is_published" className="text-xs font-semibold text-[#1C2420]">
                  Publish immediately on public website
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingFaq(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSavingFaq}>
                  {editingFaq.isNew ? 'Create FAQ' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE FAQ MODAL */}
      {deletingFaq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E3DED6] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-[#A63B30]">
              <div className="w-10 h-10 rounded-2xl bg-[#FCECE9] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#A63B30]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1C2420]">Delete FAQ?</h3>
                <p className="text-xs text-[#78867E]">This item will be permanently removed.</p>
              </div>
            </div>
            <p className="text-xs text-[#54635B] bg-[#FBF9F5] p-3 rounded-xl border border-[#EDE9E1]">
              "{deletingFaq.question}"
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeletingFaq(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteFaq}
                isLoading={isDeletingFaq}
                className="bg-[#A63B30] hover:bg-red-700 text-white border-transparent"
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT / CREATE TESTIMONIAL MODAL */}
      {/* ========================================================================= */}
      {editingTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#E3DED6] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE9E1]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#FAF2E4] text-[#9E6B1F] flex items-center justify-center">
                  <Quote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C2420]">
                    {editingTestimonial.isNew ? 'Add Client Testimonial' : 'Edit Testimonial'}
                  </h3>
                  <p className="text-xs text-[#54635B]">Consensual, anonymous client impact stories</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTestimonial(null)}
                className="p-1.5 text-[#78867E] hover:text-[#1C2420] rounded-lg hover:bg-[#F4EFEA]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">Client Alias / Initials *</label>
                <input
                  type="text"
                  required
                  value={editingTestimonial.client_alias || ''}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, client_alias: e.target.value })}
                  placeholder="e.g. Wanjiku M., Corporate Executive"
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">Session Category</label>
                <input
                  type="text"
                  value={editingTestimonial.session_category || 'Individual Care'}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, session_category: e.target.value })}
                  placeholder="e.g. Individual Therapy, Couples Mediation"
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C2420] mb-1">Client Quote *</label>
                <textarea
                  rows={4}
                  required
                  value={editingTestimonial.quote || ''}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                  placeholder="Describe the client's therapeutic transformation..."
                  className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl p-3 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#1C2420]">
                  <input
                    type="checkbox"
                    checked={editingTestimonial.is_verified !== false}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, is_verified: e.target.checked })}
                    className="rounded border-[#E3DED6] text-[#2D5A46] focus:ring-[#2D5A46]"
                  />
                  Mark as Verified Care
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-[#1C2420]">
                  <input
                    type="checkbox"
                    checked={editingTestimonial.is_published !== false}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, is_published: e.target.checked })}
                    className="rounded border-[#E3DED6] text-[#2D5A46] focus:ring-[#2D5A46]"
                  />
                  Published on public site
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingTestimonial(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSavingTestimonial}>
                  {editingTestimonial.isNew ? 'Create Testimonial' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TESTIMONIAL MODAL */}
      {deletingTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E3DED6] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-[#A63B30]">
              <div className="w-10 h-10 rounded-2xl bg-[#FCECE9] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#A63B30]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1C2420]">Delete Testimonial?</h3>
                <p className="text-xs text-[#78867E]">Remove feedback from public showcase.</p>
              </div>
            </div>
            <p className="text-xs text-[#54635B] bg-[#FBF9F5] p-3 rounded-xl border border-[#EDE9E1]">
              "{deletingTestimonial.client_alias}"
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeletingTestimonial(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteTestimonial}
                isLoading={isDeletingTestimonial}
                className="bg-[#A63B30] hover:bg-red-700 text-white border-transparent"
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE INQUIRY MODAL */}
      {deletingInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E3DED6] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-[#A63B30]">
              <div className="w-10 h-10 rounded-2xl bg-[#FCECE9] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-[#A63B30]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1C2420]">Delete Contact Inquiry?</h3>
                <p className="text-xs text-[#78867E]">Remove from admin messages ledger.</p>
              </div>
            </div>
            <p className="text-xs text-[#54635B] bg-[#FBF9F5] p-3 rounded-xl border border-[#EDE9E1]">
              From: <strong className="text-[#1C2420]">{deletingInquiry.name}</strong> ({deletingInquiry.email})
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDeletingInquiry(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteInquiry}
                isLoading={isDeletingInquiry}
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
