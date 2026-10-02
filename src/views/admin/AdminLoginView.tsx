import React, { useState, useEffect } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { Logo } from '../../components/common/Logo';

interface AdminLoginViewProps {
  navigate: (path: string) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ navigate }) => {
  const { login, user } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Set noindex meta tag for search engines while on the private admin view
  useEffect(() => {
    let metaTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    let created = false;
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'robots';
      document.head.appendChild(metaTag);
      created = true;
    }
    const previousContent = metaTag.content;
    metaTag.content = 'noindex, nofollow';

    return () => {
      if (metaTag) {
        if (created) {
          metaTag.remove();
        } else {
          metaTag.content = previousContent || 'index, follow';
        }
      }
    };
  }, []);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      showToast('Authenticated securely. Welcome to Be Sawa Management Console.', 'success');
      navigate('/admin/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Invalid credentials or access denied.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 md:py-20 max-w-md mx-auto px-4">
      <div className="bg-white rounded-3xl p-8 border border-[#E3DED6] shadow-xl space-y-6">
        <div className="text-center space-y-3 pb-2 border-b border-[#EDE9E1]">
          <Logo variant="vertical" size="lg" showTagline={true} />
          <div className="pt-2">
            <span className="text-[11px] uppercase font-bold tracking-widest text-[#2D5A46] bg-[#EBF2EE] px-3 py-1 rounded-full">
              Operations &amp; Admin Console
            </span>
          </div>
          <p className="text-xs text-[#54635B] pt-1">
            Secure administrative access for Muthoni Maina and technical platform management.
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-[#F8F9FA] p-3 rounded-xl border border-[#E3DED6] text-[11px] text-[#54635B] flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[#2D5A46] shrink-0" />
          <span>Restricted Portal. Failed login attempts are monitored and rate-limited.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1C2420] mb-1.5">
              Authorized Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#78867E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="name@besawa.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1C2420] placeholder-[#A09D96] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1C2420] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#78867E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FBF9F5] border border-[#E3DED6] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1C2420] placeholder-[#A09D96] focus:outline-none focus:ring-2 focus:ring-[#2D5A46]"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Authenticate &amp; Sign In
          </Button>
        </form>

        <div className="pt-4 border-t border-[#EDE9E1] text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-[#54635B] hover:text-[#1C2420] cursor-pointer"
          >
            ← Return to Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
