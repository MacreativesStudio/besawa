import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { PublicTherapist } from '../../types';
import { TherapistCard } from '../../components/cards/TherapistCard';
import { SwipableTherapistShowcase } from '../../components/therapists/SwipableTherapistShowcase';
import { TherapistProfileModal } from '../../components/therapists/TherapistProfileModal';
import {
  Loader2,
  ShieldCheck,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

interface TherapistsViewProps {
  navigate: (path: string, params?: any) => void;
}

export const TherapistsView: React.FC<TherapistsViewProps> = ({ navigate }) => {
  const [therapists, setTherapists] = useState<PublicTherapist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [isLoading, setIsLoading] = useState(true);
  const [profileTherapist, setProfileTherapist] = useState<PublicTherapist | null>(null);

  useEffect(() => {
    api
      .getPublicTherapists()
      .then((res) => {
        setTherapists(res.therapists);
      })
      .catch((err) => console.error('Failed loading therapists:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = therapists.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.full_name.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.areas_of_practice.some((a) => a.toLowerCase().includes(q)) ||
      t.bio.toLowerCase().includes(q);

    const matchesLang =
      selectedLanguage === 'ALL' || t.languages.includes(selectedLanguage);

    return matchesSearch && matchesLang;
  });

  return (
    <div className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mb-10">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2D5A46] bg-[#EBF2EE] px-3 py-1 rounded-full mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-[#286E47]" />
          Verified Licensed Psychologists
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C2420] tracking-tight">
          Meet Our Therapists
        </h1>
        <p className="text-base text-[#54635B] mt-3 leading-relaxed">
          At Be Sawa, we believe healing happens in relationship. Our practitioners are licensed psychological counselors with extensive experience in evidence-based therapy, trauma-informed care, and culturally sensitive practice in Kenya.
        </p>
      </div>

      {/* Controls Bar: Search, Filter & View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b border-[#E3DED6]">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-[#78867E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by therapist name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#E3DED6] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1C2420] placeholder-[#78867E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
          />
        </div>

        {/* View Mode Toggle & Language Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#78867E] shrink-0" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-white border border-[#E3DED6] rounded-xl px-3 py-2 text-xs font-medium text-[#1C2420] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
            >
              <option value="ALL">All Languages</option>
              <option value="English">English</option>
              <option value="Swahili">Swahili</option>
              <option value="Kikuyu">Kikuyu</option>
              <option value="Luo">Luo</option>
            </select>
          </div>

          {/* Switch View Buttons */}
          <div className="flex items-center bg-[#EDE7DD] p-1 rounded-xl border border-[#E3DED6]">
            <button
              type="button"
              onClick={() => setViewMode('carousel')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'carousel'
                  ? 'bg-white text-[#2D5A46] shadow-xs'
                  : 'text-[#78867E] hover:text-[#1C2420]'
              }`}
              title="Swipable profile carousel"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Swipable Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white text-[#2D5A46] shadow-xs'
                  : 'text-[#78867E] hover:text-[#1C2420]'
              }`}
              title="Directory Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#54635B]">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#2D5A46]" />
          <p className="text-sm">Loading practitioner directory...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#E3DED6] p-8">
          <p className="text-base font-medium text-[#1C2420] mb-2">No therapists match your search</p>
          <p className="text-xs text-[#78867E]">
            Try clearing filters or searching for general terms like "anxiety", "couples", or "trauma".
          </p>
        </div>
      ) : viewMode === 'carousel' && !searchQuery ? (
        <SwipableTherapistShowcase
          therapists={filtered}
          onSelectTherapist={(therapistId) => navigate('/book', { therapistId })}
          title="All Care Practitioners"
          subtitle="Swipe horizontally or use arrows to discover practitioner specializations, credentials, and availability."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((therapist) => (
            <TherapistCard
              key={therapist.id}
              therapist={therapist}
              onSelect={(therapistId) => navigate('/book', { therapistId })}
              onViewProfile={(t) => setProfileTherapist(t)}
            />
          ))}
        </div>
      )}

      {/* Individual Therapist Profile Modal */}
      <TherapistProfileModal
        therapist={profileTherapist}
        onClose={() => setProfileTherapist(null)}
        onBook={(therapistId) => navigate('/book', { therapistId })}
      />
    </div>
  );
};
