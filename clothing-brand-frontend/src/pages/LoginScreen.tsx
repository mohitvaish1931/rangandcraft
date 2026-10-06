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

const LoginScreen = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const redirect = params.get('redirect');

  useEffect(() => {
    if (state.user) navigate(safeRedirect(redirect, state.user.isAdmin ? '/admin' : '/profile'), { replace: true });
  }, [state.user, redirect, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = await postJSON<any>(API_ENDPOINTS.AUTH.LOGIN, { email: email.trim(), password });
      dispatch({ type: 'SET_USER', payload: toSessionUser(data) });
      toast.success(`Welcome back, ${data.name.split(' ')[0]}!`);
    } catch (err) {
      setError(errorMessage(err, 'Sign in failed. Please check your details.'));
      setLoading(false);
    }
  };

  return (
    <AuthLayout quote="Rooted in Jaipur. Made for the way you live.">
      <Seo title="Sign in" path="/login" noindex />
      <span className="rc-eyebrow">Welcome back</span>
      <h1 className="rc-h1">Sign in</h1>
      <p className="rc-muted">Track orders, save your address and check out faster.</p>
      {error && <div className="rc-alert rc-alert--error" role="alert">{error}</div>}
      <form onSubmit={submit} style={{ display: 'grid', gap: 16 }}>
        <div className="rc-field">
          <label className="rc-label" htmlFor="login-email">Email</label>
          <input id="login-email" className="rc-input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="rc-field">
          <label className="rc-label" htmlFor="login-password">Password</label>
          <PasswordInput id="login-password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="rc-btn rc-btn--lg rc-btn--block" disabled={loading}>
          {loading ? <span className="rc-spinner" /> : 'Sign in'}
        </button>
      </form>
      <p className="rc-muted" style={{ fontSize: 14 }}>
        Forgot your password? <a href="https://wa.me/919351325459?text=Hi!%20I%20need%20help%20resetting%20my%20password." target="_blank" rel="noopener noreferrer">Message us</a> and we’ll help you reset it.
      </p>
      <p style={{ fontSize: 15 }}>
        New to Rang and Craft? <Link to={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} style={{ color: 'var(--rc-brand)', fontWeight: 500 }}>Create an account</Link>
      </p>
    </AuthLayout>
  );
};

export default LoginScreen;
