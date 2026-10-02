import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { Service, ServiceCategory } from '../../types';
import { ServiceCard } from '../../components/cards/ServiceCard';
import { Loader2, ShieldCheck, HeartHandshake } from 'lucide-react';

interface ServicesViewProps {
  navigate: (path: string, params?: any) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ navigate }) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .getServices()
      .then((res) => {
        setCategories(res.categories);
        setServices(res.services);
      })
      .catch((err) => console.error('Failed loading services:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredServices = services.filter((s) => {
    const matchesCategory = selectedCategory === 'ALL' || s.category_id === selectedCategory;
    const matchesMode =
      selectedMode === 'ALL' || s.delivery_mode === selectedMode || s.delivery_mode === 'BOTH';
    return matchesCategory && matchesMode;
  });

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9E5D43] bg-[#F7EFEA] px-3 py-1 rounded-full mb-3">
          Evidence-Based Care
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C2420] tracking-tight">
          Counselling & Therapy Services
        </h1>
        <p className="text-base text-[#54635B] mt-3 leading-relaxed">
          Explore our range of professional psychological interventions. Every session is held in strict clinical confidentiality, whether you connect online from home or visit our serene practice in Kilimani, Nairobi.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E3DED6]">
        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-[#2D5A46] text-white'
                : 'bg-white text-[#54635B] hover:bg-[#F4EFEA] border border-[#E3DED6]'
            }`}
          >
            All Specialties ({services.length})
          </button>
          {categories.map((c) => {
            const count = services.filter((s) => s.category_id === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === c.id
                    ? 'bg-[#2D5A46] text-white'
                    : 'bg-white text-[#54635B] hover:bg-[#F4EFEA] border border-[#E3DED6]'
                }`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Delivery Mode Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[#78867E] font-medium">Session Mode:</span>
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="text-xs font-medium bg-white border border-[#E3DED6] rounded-xl px-3 py-2 text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
          >
            <option value="ALL">Any (Online or In-Person)</option>
            <option value="ONLINE">Online Only</option>
            <option value="IN_PERSON">In-Person Only</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#54635B]">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#2D5A46]" />
          <p className="text-sm">Loading counselling services...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#E3DED6] p-8">
          <p className="text-base font-medium text-[#1C2420] mb-2">No services found for this filter</p>
          <p className="text-xs text-[#78867E]">Try selecting "All Specialties" or changing the delivery mode.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onBook={(serviceId) => navigate('/book', { serviceId })}
            />
          ))}
        </div>
      )}

      {/* Safety and Reassurance Note */}
      <div className="mt-16 bg-[#EBF2EE] p-6 rounded-2xl border border-[#2D5A46]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#286E47] shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-[#1C2420]">Not sure which service is right for you?</h4>
            <p className="text-xs text-[#54635B] mt-0.5">
              Contact our care coordinator for gentle guidance, or book an Individual Initial Consultation to discuss your goals.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/contact')}
          className="text-xs font-bold text-[#2D5A46] hover:underline whitespace-nowrap cursor-pointer"
        >
          Speak with Coordinator →
        </button>
      </div>
    </div>
  );
};
