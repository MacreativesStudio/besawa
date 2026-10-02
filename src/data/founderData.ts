export interface FounderPhilosophyPillar {
  title: string;
  tagline: string;
  description: string;
  iconName: 'heart' | 'shield' | 'compass' | 'layers';
}

export interface FounderData {
  publicName: string;
  roleTitle: string;
  location: string;
  contactWhatsApp: string;
  displayPhone: string;
  visionStatement: string;
  quote: string;
  aboutFounder: string;
  whyBeSawaExists: string[];
  philosophyPillars: FounderPhilosophyPillar[];
  founderNote: string;
}

export const muthoniMainaFounderData: FounderData = {
  publicName: 'Muthoni Maina',
  roleTitle: 'Founder of Be Sawa',
  location: 'Nairobi, Kenya',
  contactWhatsApp: '254710759422',
  displayPhone: '+254 710 759 422',
  visionStatement: 'Creating dignified, emotionally safe, and accessible mental wellness sanctuaries across Kenya.',
  quote:
    'Healing is not about becoming someone foreign to yourself. It is about gently setting down the burdens you were never meant to carry alone, so you can safely come home to peace.',
  aboutFounder:
    'Muthoni Maina is the founder of Be Sawa. Guided by deep empathy, human dignity, and a passion for community wellbeing, Muthoni established Be Sawa as an intentional sanctuary where seeking psychological support is normalized, respected, and accessible to families, young people, and adults.',
  whyBeSawaExists: [
    'Be Sawa was born from a clear conviction: emotional support in Kenya must be safe, confidential, and free of shame.',
    'For too long, individuals navigating grief, anxiety, relational friction, and everyday burnout have felt isolated. Be Sawa provides a structured, warm bridge connecting people with verified practitioners who listen with clinical excellence and genuine human respect.',
    'Our vision is to build an enduring culture of emotional wholeness—grounded in African relational dignity, ethical governance, and unconditional care.',
  ],
  philosophyPillars: [
    {
      title: 'Human Dignity First',
      tagline: 'You are met with warmth, never clinical judgment.',
      description:
        'Every individual, couple, and child entering our sanctuary is received with unconditional positive regard and profound respect.',
      iconName: 'heart',
    },
    {
      title: 'Relational Safety (Ubuntu)',
      tagline: 'We heal in relationship, never in isolation.',
      description:
        'Balancing personal self-awareness with the restorative strength of family systems, community belonging, and grounded African solidarity.',
      iconName: 'shield',
    },
    {
      title: 'Rigorous Professional Standards',
      tagline: 'Empathetic presence backed by ethical governance.',
      description:
        'All collaborating counselors operate under strict verification, ethical supervisory accountability, and adherence to professional board standards.',
      iconName: 'layers',
    },
    {
      title: 'Accessible & Low-Barrier',
      tagline: 'Clear rates, simple booking, and real human support.',
      description:
        'Transparent pricing, straightforward scheduling, and responsive WhatsApp care coordination ensure care is always within reach.',
      iconName: 'compass',
    },
  ],
  founderNote:
    'Be Sawa belongs to our community. If you have been hesitant or uncertain about beginning counselling, take heart: you are worthy of peace, and we are here to walk with you.',
};
