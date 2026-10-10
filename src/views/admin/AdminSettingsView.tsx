import React, { useState, useEffect } from 'react';
import {
  Settings,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  Phone,
  Mail,
  Save,
  CheckCircle2,
  Lock,
  Percent,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api';

export const AdminSettingsView: React.FC = () => {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Clinic Parameters
  const [clinicConfig, setClinicConfig] = useState({
    clinicName: 'BE SAWA Psychological Wellbeing Sanctuary',
    locationAddress: 'Kilimani Consultation Rooms, Off Argwings Kodhek Rd, Nairobi, Kenya',
    operatingHours: 'Monday – Saturday: 08:00 AM – 07:00 PM EAT',
    emergencyPhone: '0710 759 422',
    officialEmail: 'care@besawa.ke',
    therapistSplitPercent: 70,
    platformSplitPercent: 30,
    tillNumber: '174379',
    tillName: 'BE SAWA WELLBEING',
    darajaEnvironment: 'Production / Sandbox Ready',
    autoConfirmMpesa: true,
    telehealthProvider: 'Google Meet Encrypted Telehealth',
  });

  useEffect(() => {
    api
      .getAdminSettings()
      .then((res) => {
        if (res.settings) {
          const s = res.settings;
          setClinicConfig((prev) => ({
            ...prev,
            clinicName: s.brand_name ? `${s.brand_name} ${s.descriptor || ''}` : prev.clinicName,
            locationAddress: s.location || prev.locationAddress,
            officialEmail: s.contact_email || prev.officialEmail,
            emergencyPhone: (s.contact_phones && s.contact_phones[0]) || prev.emergencyPhone,
            platformSplitPercent: s.platform_commission_percent ?? prev.platformSplitPercent,
            therapistSplitPercent: s.platform_commission_percent ? 100 - s.platform_commission_percent : prev.therapistSplitPercent,
            tillNumber: s.mpesa_till_number || prev.tillNumber,
          }));
        }
      })
      .catch((err) => console.warn('Could not fetch settings:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateAdminSettings({
        location: clinicConfig.locationAddress,
        contact_email: clinicConfig.officialEmail,
        mpesa_till_number: clinicConfig.tillNumber,
        platform_commission_percent: Number(clinicConfig.platformSplitPercent),
        contact_phones: [clinicConfig.emergencyPhone, '0745024278'],
      });
      showToast('Clinic operational configuration saved successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed saving configuration.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2420]">Clinic & System Configuration</h1>
          <p className="text-xs text-[#54635B] mt-1">
            Manage physical consultation rooms, Daraja M-Pesa till parameters, and the 70/30 platform payout model.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          isLoading={isSaving}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save Configuration
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Physical Clinic & Operating Hours */}
        <div className="bg-white rounded-2xl p-6 border border-[#E3DED6] shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#EDE9E1]">
            <div className="w-8 h-8 rounded-xl bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1C2420]">Kilimani In-Person Consulting Rooms</h2>
              <p className="text-[11px] text-[#54635B]">
                In-person appointment instructions dispatched to clients upon M-Pesa confirmation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1C2420] mb-1">
                Facility & Sanctuary Title
              </label>
              <input
                type="text"
                value={clinicConfig.clinicName}
                onChange={(e) => setClinicConfig({ ...clinicConfig, clinicName: e.target.value })}
                className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1C2420] mb-1">
                Operating Days & Hours
              </label>
              <input
                type="text"
                value={clinicConfig.operatingHours}
                onChange={(e) => setClinicConfig({ ...clinicConfig, operatingHours: e.target.value })}
                className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-[#1C2420] mb-1">
                Full Physical Address (Kilimani)
              </label>
              <input
                type="text"
                value={clinicConfig.locationAddress}
                onChange={(e) => setClinicConfig({ ...clinicConfig, locationAddress: e.target.value })}
                className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Safaricom Daraja M-Pesa & Split Model */}
        <div className="bg-white rounded-2xl p-6 border border-[#E3DED6] shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#EDE9E1]">
            <div className="w-8 h-8 rounded-xl bg-[#EBF2EE] text-[#2D5A46] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1C2420]">Safaricom M-Pesa Integration & 80/20 Revenue Split</h2>
              <p className="text-[11px] text-[#54635B]">
                Daraja STK push configuration and automatic practitioner settlement pool engine.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1C2420] mb-1">
                Buy Goods Till Number
              </label>
              <input
                type="text"
                value={clinicConfig.tillNumber}
                onChange={(e) => setClinicConfig({ ...clinicConfig, tillNumber: e.target.value })}
                className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs text-[#1C2420] font-mono focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
              />
              <span className="text-[10px] text-[#78867E] mt-1 block">Displayed on payment screens</span>
            </div>

            <div>
              <label className="block font-semibold text-[#1C2420] mb-1">
                Till Registered Name
              </label>
              <input
                type="text"
                value={clinicConfig.tillName}
                onChange={(e) => setClinicConfig({ ...clinicConfig, tillName: e.target.value })}
                className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
              />
              <span className="text-[10px] text-[#78867E] mt-1 block">Verified Safaricom Merchant</span>
            </div>

            <div>
              <label className="block font-semibold text-[#1C2420] mb-1">
                Therapist Split Ratio
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={clinicConfig.therapistSplitPercent}
                  disabled
                  className="w-full bg-[#EBF2EE] border border-[#2D5A46]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#2D5A46] font-bold cursor-not-allowed"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#2D5A46]">
                  %
                </span>
              </div>
              <span className="text-[10px] text-[#286E47] font-semibold mt-1 block">
                Platform retains 30% for infrastructure
              </span>
            </div>
          </div>
        </div>

        {/* 3. Official Contact & Compliance Endpoints */}
        <div className="bg-white rounded-2xl p-6 border border-[#E3DED6] shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#EDE9E1]">
            <div className="w-8 h-8 rounded-xl bg-[#FAF2E4] text-[#9E6B1F] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1C2420]">Communications & Clinical Data Governance</h2>
              <p className="text-[11px] text-[#54635B]">
                Public-facing inquiries and Kenyan Data Protection Act safeguard standards.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#1C2420] mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#2D5A46]" />
                Official Admin & Clinical Email
              </label>
              <input
                type="email"
                value={clinicConfig.officialEmail}
                onChange={(e) => setClinicConfig({ ...clinicConfig, officialEmail: e.target.value })}
                className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#1C2420] mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#2D5A46]" />
                Official WhatsApp & Call Line
              </label>
              <input
                type="text"
                value={clinicConfig.emergencyPhone}
                onChange={(e) => setClinicConfig({ ...clinicConfig, emergencyPhone: e.target.value })}
                className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl px-3.5 py-2.5 text-xs text-[#1C2420] focus:ring-2 focus:ring-[#2D5A46] focus:outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-[#FBF9F5] rounded-xl border border-[#EDE9E1] text-xs text-[#54635B] space-y-2">
            <div className="font-bold text-[#1C2420] flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#2D5A46]" />
              Data Safeguard Guarantee
            </div>
            <p className="text-[11px] leading-relaxed">
              In accordance with Kenyan clinical psychological standards, all psychotherapy notes and therapeutic records
              are maintained offline directly between verified practitioners and clients. No sensitive patient mental health
              diagnoses are ever logged in the platform web tier or public relational schemas.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
