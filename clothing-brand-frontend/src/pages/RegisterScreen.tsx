import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import Seo from '../components/Seo';
import { API_ENDPOINTS, postJSON } from '../utils/api';
import { errorMessage } from '../lib/format';
import { safeRedirect, toSessionUser } from '../lib/session';
import { useToast } from '../lib/toast';

const RegisterScreen = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const redirect = params.get('redirect');

  useEffect(() => {
    if (state.user) navigate(safeRedirect(redirect, '/profile'), { replace: true });
  }, [state.user, redirect, navigate]);

  const set = (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await postJSON<any>(API_ENDPOINTS.AUTH.REGISTER, { name: form.name.trim(), email: form.email.trim(), password: form.password });
      dispatch({ type: 'SET_USER', payload: toSessionUser(data) });
      toast.success('Welcome to Rang and Craft!');
    } catch (err) {
      setError(errorMessage(err, 'Could not create your account. Please try again.'));
      setLoading(false);
    }
  };

  return (
    <AuthLayout quote="Join us for early access to new prints and members-only offers.">
      <Seo title="Create account" path="/register" noindex />
      <span className="rc-eyebrow">Join Rang and Craft</span>
      <h1 className="rc-h1">Create account</h1>
      {error && <div className="rc-alert rc-alert--error" role="alert">{error}</div>}
      <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
        <div className="rc-field">
          <label className="rc-label" htmlFor="reg-name">Full name</label>
          <input id="reg-name" name="name" className="rc-input" autoComplete="name" required value={form.name} onChange={set} />
        </div>
        <div className="rc-field">
          <label className="rc-label" htmlFor="reg-email">Email</label>
          <input id="reg-email" name="email" type="email" className="rc-input" autoComplete="email" required value={form.email} onChange={set} />
        </div>
        <div className="rc-field">
          <label className="rc-label" htmlFor="reg-password">Password</label>
          <PasswordInput id="reg-password" name="password" autoComplete="new-password" minLength={6} required value={form.password} onChange={set} />
          <span className="rc-muted" style={{ fontSize: 13 }}>At least 6 characters</span>
        </div>
        <div className="rc-field">
          <label className="rc-label" htmlFor="reg-confirm">Confirm password</label>
          <PasswordInput id="reg-confirm" name="confirm" autoComplete="new-password" required value={form.confirm} onChange={set} />
        </div>
        <button type="submit" className="rc-btn rc-btn--lg rc-btn--block" disabled={loading}>
          {loading ? <span className="rc-spinner" /> : 'Create account'}
        </button>
      </form>
      <p className="rc-muted" style={{ fontSize: 13 }}>
        By creating an account you agree to our <Link to="/terms-conditions">Terms</Link> and <Link to="/privacy-policy">Privacy Policy</Link>.
      </p>
      <p style={{ fontSize: 15 }}>
        Already have an account? <Link to={`/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} style={{ color: 'var(--rc-brand)', fontWeight: 500 }}>Sign in</Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterScreen;
