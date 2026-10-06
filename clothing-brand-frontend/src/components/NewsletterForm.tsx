import { useState } from 'react';
import { API_ENDPOINTS, postJSON } from '../utils/api';
import { errorMessage } from '../lib/format';
import { useToast } from '../lib/toast';

const NewsletterForm = ({ source = 'footer', light = true }: { source?: string; light?: boolean }) => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await postJSON(API_ENDPOINTS.NEWSLETTER, { email, source });
      setStatus('done');
      setEmail('');
      toast.success('You’re on the list — watch your inbox for new drops.');
    } catch (err) {
      setStatus('idle');
      toast.error(errorMessage(err));
    }
  };

  if (status === 'done') {
    return <p style={{ fontWeight: 400 }}>Thank you for subscribing. ✦</p>;
  }

  return (
    <form className={light ? 'rc-inline-form' : 'rc-inline-form rc-inline-form--dark'} onSubmit={submit}>
      <label htmlFor={`nl-${source}`} className="rc-sr-only">Email address</label>
      <input
        id={`nl-${source}`}
        type="email"
        required
        className="rc-input"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <button type="submit" className="rc-btn rc-btn--gold" disabled={status === 'loading'}>
        {status === 'loading' ? <span className="rc-spinner" /> : 'Subscribe'}
      </button>
    </form>
  );
};

export default NewsletterForm;
