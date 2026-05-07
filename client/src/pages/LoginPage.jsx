import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Invalid credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — image panel */}
      <div className="hidden lg:block lg:w-[50%] relative">
        <img
          src="/images/login-hero.png"
          alt="Office interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-0 left-0 right-0 p-10">
          <p className="text-white/90 text-[13px] font-semibold tracking-wide uppercase mb-1">
            Clockwork ATS
          </p>
          <p className="text-white/60 text-[13px] leading-relaxed max-w-md">
            Applicant tracking and recruitment pipeline management for staffing agencies.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-[340px]">
          <div className="mb-8">
            <p className="text-[11px] font-semibold text-text-muted tracking-widest uppercase mb-3">
              Clockwork ATS
            </p>
            <h1 className="text-[22px] font-semibold text-text-primary leading-tight">Sign in to your account</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            <div>
              <label htmlFor="email" className="block text-[12px] font-medium text-text-secondary mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-[9px] rounded border border-border bg-white text-text-primary text-[13px] placeholder:text-text-placeholder"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[12px] font-medium text-text-secondary mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 py-[9px] rounded border border-border bg-white text-text-primary text-[13px] placeholder:text-text-placeholder"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              id="login-button"
              disabled={submitting}
              className="w-full py-[9px] px-4 rounded bg-accent hover:bg-accent-hover text-white text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border-light">
            <p className="text-[12px] text-text-muted">
              No account?{' '}
              <Link to="/register" className="text-text-primary font-medium hover:underline">
                Register your agency
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
