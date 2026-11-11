import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { errorMessage } from '../services/api';

const ROLES = [
  { value: 'buyer', title: 'Buyer', desc: 'Browse homes and chat with agents' },
  { value: 'agent', title: 'Agent', desc: 'List properties and talk to buyers' },
];

export default function Signup() {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Please enter your name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error('Enter a valid email');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setSubmitting(true);
    try {
      const user = await signup(form);
      toast.success('Account created!');
      navigate(user.role === 'agent' ? '/dashboard' : '/', { replace: true });
    } catch (err) {
      toast.error(errorMessage(err, 'Signup failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-surface px-4 py-10">
      <div className="card w-full max-w-md p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-ink">Create your account</h1>
        <p className="mt-1 text-sm text-neutral-500">Join PropChat in less than a minute.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <span className="label">I am a…</span>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => {
                const active = form.role === r.value;
                return (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`rounded-xl border-2 p-3 text-left transition ${
                      active ? 'border-brand bg-white' : 'border-line bg-white hover:bg-surface'
                    }`}
                    aria-pressed={active}
                  >
                    <p className="text-sm font-semibold text-ink">{r.title}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">{r.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="name">
              Full name
            </label>
            <input id="name" className="input" autoComplete="name" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" type="email" autoComplete="email" className="input" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="input"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={set('password')}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating account…' : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-ink underline underline-offset-4 hover:text-brand">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
