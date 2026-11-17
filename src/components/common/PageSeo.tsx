import { useEffect } from 'react';

const siteUrl = 'https://besawa.co.ke';
const pageDetails: Record<string, { title: string; description: string }> = {
  '/': { title: 'Therapy & Counselling in Nairobi | Be Sawa', description: 'Professional, confidential counselling and mental wellness support in Nairobi and online across Kenya.' },
  '/services': { title: 'Online & Nairobi Therapy Services | Be Sawa', description: 'Explore confidential online and in-person counselling services from Be Sawa’s Kenyan mental wellness practitioners.' },
  '/packages': { title: 'Therapy Care Packages | Be Sawa', description: 'Choose a structured counselling pathway with transparent pricing and continuity of care from Be Sawa.' },
  '/therapists': { title: 'Meet Our Counsellors | Be Sawa', description: 'Meet Be Sawa’s care practitioners and find confidential support online or in Nairobi.' },
  '/resources': { title: 'Mental Wellness Resources | Be Sawa', description: 'Practical, compassionate mental wellness resources from Be Sawa.' },
  '/contact': { title: 'Contact Be Sawa | Counselling Support', description: 'Contact Be Sawa to ask about confidential counselling support in Nairobi or online.' },
};
export function PageSeo({ path }: { path: string }) {
  useEffect(() => {
    const details = pageDetails[path] || pageDetails['/']; const url = `${siteUrl}${path === '/' ? '/' : path}`;
    document.title = details.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', details.description);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', details.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', details.description);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
    const robots = document.querySelector('meta[name="robots"]');
    robots?.setAttribute('content', path === '/book' || path === '/lookup' ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  }, [path]);
  return null;
}
