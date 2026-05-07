import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agencyName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.agencyName) {
      toast.error('All fields are required.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password, form.agencyName);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3 py-[9px] rounded border border-border bg-white text-text-primary text-[13px] placeholder:text-text-placeholder';

  return (
    <div className="min-h-screen flex">
      {/* Left — abstract panel */}
      <div className="hidden lg:flex lg:w-[50%] relative flex-col justify-end"
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 40%, #252525 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
        />
        <div className="relative p-10">
          <p className="text-white/90 text-[13px] font-semibold tracking-wide uppercase mb-1">
            Clockwork ATS
          </p>
          <p className="text-white/40 text-[13px] leading-relaxed max-w-sm">
            Set up your agency account and start managing your recruitment pipeline today.
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
            <h1 className="text-[22px] font-semibold text-text-primary leading-tight">Create your account</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5" id="register-form">
            <div>
              <label htmlFor="name" className="block text-[12px] font-medium text-text-secondary mb-1">Full name</label>
              <input id="name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="First and last name" className={inputClass} autoComplete="name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-[12px] font-medium text-text-secondary mb-1">Work email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@company.com" className={inputClass} autoComplete="email" />
            </div>
            <div>
              <label htmlFor="agencyName" className="block text-[12px] font-medium text-text-secondary mb-1">Agency name</label>
              <input id="agencyName" name="agencyName" type="text" value={form.agencyName} onChange={handleChange} placeholder="Your organisation name" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="password" className="block text-[12px] font-medium text-text-secondary mb-1">Password</label>
                <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" className={inputClass} autoComplete="new-password" />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-[12px] font-medium text-text-secondary mb-1">Confirm</label>
                <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter" className={inputClass} autoComplete="new-password" />
              </div>
            </div>

            <button
              type="submit"
              id="register-button"
              disabled={submitting}
              className="w-full py-[9px] px-4 rounded bg-accent hover:bg-accent-hover text-white text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-1"
            >
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border-light">
            <p className="text-[12px] text-text-muted">
              Already registered?{' '}
              <Link to="/login" className="text-text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
