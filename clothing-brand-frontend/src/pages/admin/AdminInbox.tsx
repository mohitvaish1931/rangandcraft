import { useEffect, useState } from 'react';
import { Mail, Phone, Trash2 } from 'lucide-react';
import { API_ENDPOINTS, apiCall, fetchJSON, postJSON } from '../../utils/api';
import { errorMessage } from '../../lib/format';
import { useToast } from '../../lib/toast';

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'replied' | 'closed';
  createdAt: string;
}
interface Subscriber { _id: string; email: string; source: string; createdAt: string }

const STATUS_STYLES: Record<Inquiry['status'], string> = {
  new: 'bg-amber-50 text-amber-700',
  replied: 'bg-blue-50 text-blue-700',
  closed: 'bg-gray-100 text-gray-500',
};

const AdminInbox = () => {
  const toast = useToast();
  const [tab, setTab] = useState<'messages' | 'subscribers'>('messages');
  const [data, setData] = useState<{ inquiries: Inquiry[]; subscribers: Subscriber[] } | null>(null);

  useEffect(() => {
    fetchJSON<{ inquiries: Inquiry[]; subscribers: Subscriber[] }>(API_ENDPOINTS.CONTACT)
      .then(setData)
      .catch((err) => { toast.error(errorMessage(err)); setData({ inquiries: [], subscribers: [] }); });
  }, [toast]);

  const setStatus = async (id: string, status: Inquiry['status']) => {
    try {
      const updated = await postJSON<Inquiry>(`${API_ENDPOINTS.CONTACT}/${id}`, { status }, 'PUT');
      setData((d) => d && { ...d, inquiries: d.inquiries.map((i) => (i._id === id ? updated : i)) });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await apiCall(`${API_ENDPOINTS.CONTACT}/${id}`, { method: 'DELETE' });
      setData((d) => d && { ...d, inquiries: d.inquiries.filter((i) => i._id !== id) });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const exportCsv = () => {
    if (!data) return;
    const csv = ['email,source,subscribed_at', ...data.subscribers.map((s) => `${s.email},${s.source},${s.createdAt}`)].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const newCount = data?.inquiries.filter((i) => i.status === 'new').length ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inbox</h1>
          <p className="text-sm text-gray-500 mt-1">Contact-form messages and newsletter sign-ups from the store.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab('messages')} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'messages' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
            Messages{newCount > 0 ? ` (${newCount} new)` : ''}
          </button>
          <button onClick={() => setTab('subscribers')} className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'subscribers' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
            Subscribers{data ? ` (${data.subscribers.length})` : ''}
          </button>
        </div>
      </div>

      {!data ? (
        <div className="p-10 text-center text-gray-400">Loading…</div>
      ) : tab === 'messages' ? (
        data.inquiries.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No messages yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {data.inquiries.map((m) => (
              <li key={m._id} className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-gray-900">{m.name}</span>
                    <span className="text-xs uppercase tracking-wide text-gray-400">{m.subject}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[m.status]}`}>{m.status}</span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line mb-3">{m.message}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900"><Mail className="w-4 h-4" /> {m.email}</a>
                  {m.phone && <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900"><Phone className="w-4 h-4" /> {m.phone}</a>}
                  <select value={m.status} onChange={(e) => setStatus(m._id, e.target.value as Inquiry['status'])} className="ml-auto border border-gray-200 rounded-lg px-2 py-1 text-sm">
                    <option value="new">New</option>
                    <option value="replied">Replied</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button onClick={() => remove(m._id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50" aria-label="Delete message"><Trash2 className="w-4 h-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : (
        <div>
          <div className="px-6 py-4 flex justify-end">
            <button onClick={exportCsv} disabled={data.subscribers.length === 0} className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-40">Export CSV</button>
          </div>
          {data.subscribers.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No subscribers yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500"><th className="px-6 py-3 font-medium">Email</th><th className="px-6 py-3 font-medium">Source</th><th className="px-6 py-3 font-medium">Joined</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {data.subscribers.map((s) => (
                  <tr key={s._id}><td className="px-6 py-3">{s.email}</td><td className="px-6 py-3 text-gray-500">{s.source}</td><td className="px-6 py-3 text-gray-500">{new Date(s.createdAt).toLocaleDateString('en-IN')}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminInbox;
