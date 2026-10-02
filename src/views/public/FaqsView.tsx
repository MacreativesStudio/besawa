import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import { FAQ } from '../../types';
import { ChevronDown, ChevronUp, Search, Loader2, HelpCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';

interface FaqsViewProps {
  navigate: (path: string) => void;
}

export const FaqsView: React.FC<FaqsViewProps> = ({ navigate }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [openId, setOpenId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .getFaqs()
      .then((res) => setFaqs(res.faqs))
      .catch((err) => console.error('Failed loading FAQs:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = ['ALL', ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filtered = faqs.filter((f) => {
    const matchesCategory = selectedCategory === 'ALL' || f.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="py-12 md:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2D5A46] bg-[#EBF2EE] px-3 py-1 rounded-full mb-3">
          <HelpCircle className="w-3.5 h-3.5 text-[#2D5A46]" />
          Clear Answers
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C2420] tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-base text-[#54635B] mt-3">
          Everything you need to know about booking, sessions, therapist vetting, privacy, and M-Pesa payments at Be Sawa.
        </p>
      </div>

      {/* Search & Categories */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="w-4 h-4 text-[#78867E] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions (e.g. M-Pesa, privacy, online, reschedule)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#E3DED6] rounded-xl pl-10 pr-4 py-3 text-sm text-[#1C2420] placeholder-[#78867E] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2D5A46] text-white'
                  : 'bg-white text-[#54635B] hover:bg-[#F4EFEA] border border-[#E3DED6]'
              }`}
            >
              {cat === 'ALL' ? 'All Questions' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#54635B]">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#2D5A46]" />
          <p className="text-sm">Loading FAQs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#E3DED6] p-8">
          <p className="text-base font-medium text-[#1C2420] mb-2">No matching questions found</p>
          <p className="text-xs text-[#78867E]">Contact our care coordinator directly for any specific questions.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-16">
          {filtered.map((f) => {
            const isOpen = openId === f.id;
            return (
              <div
                key={f.id}
                className="bg-white rounded-2xl border border-[#E3DED6] overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => toggle(f.id)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FBF9F5]"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-[#1C2420]">{f.question}</span>
                  <div className="w-8 h-8 rounded-full bg-[#F4EFEA] flex items-center justify-center shrink-0 text-[#54635B]">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-[#54635B] leading-relaxed border-t border-[#EDE9E1] bg-white">
                    {f.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Still have questions */}
      <div className="bg-[#EBF2EE] rounded-3xl p-8 border border-[#2D5A46]/20 text-center space-y-4">
        <h3 className="text-xl font-bold text-[#1C2420]">Have a question that is not covered here?</h3>
        <p className="text-sm text-[#54635B] max-w-lg mx-auto leading-relaxed">
          Our care coordination team is available via WhatsApp or email to answer any inquiries before you book.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button variant="primary" size="md" onClick={() => navigate('/contact')}>
            Contact Us Directly
          </Button>
        </div>
      </div>
    </div>
  );
};
