import { useEffect, useState } from 'react';
import { Check, Star, Trash2, X, BadgeCheck } from 'lucide-react';
import { API_ENDPOINTS, fetchJSON, apiCall } from '../../utils/api';
import { errorMessage } from '../../lib/format';
import { useToast } from '../../lib/toast';

interface AdminReview {
  _id: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  verified?: boolean;
  createdAt: string;
  productId?: { _id: string; name: string; image?: string } | null;
}

const TABS = ['pending', 'approved', 'rejected'] as const;

const AdminReviews = () => {
  const toast = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]>('pending');
  const [loaded, setLoaded] = useState<{ tab: string; reviews: AdminReview[] } | null>(null);
  const reviews = loaded?.tab === tab ? loaded.reviews : null;
  const setReviews = (fn: (list: AdminReview[] | null) => AdminReview[] | null) =>
    setLoaded((l) => (l ? { ...l, reviews: fn(l.reviews) ?? [] } : l));

  useEffect(() => {
    let alive = true;
    fetchJSON<{ reviews: AdminReview[] }>(`${API_ENDPOINTS.REVIEWS}/admin/all?status=${tab}`)
      .then((d) => alive && setLoaded({ tab, reviews: d.reviews }))
      .catch((err) => { if (alive) { toast.error(errorMessage(err)); setLoaded({ tab, reviews: [] }); } });
    return () => { alive = false; };
  }, [tab, toast]);

  const act = async (id: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      if (action === 'delete') {
        if (!window.confirm('Delete this review permanently?')) return;
        await apiCall(`${API_ENDPOINTS.REVIEWS}/${id}`, { method: 'DELETE' });
      } else {
        await apiCall(`${API_ENDPOINTS.REVIEWS}/admin/${id}/${action}`, { method: 'PUT' });
      }
      setReviews((list) => list?.filter((r) => r._id !== id) ?? null);
      toast.success(action === 'approve' ? 'Review published' : action === 'reject' ? 'Review rejected' : 'Review deleted');
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">New reviews stay hidden from the store until you approve them.</p>
        </div>
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {reviews === null ? (
        <div className="p-10 text-center text-gray-400">Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div className="p-10 text-center text-gray-500">No {tab} reviews.</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {reviews.map((r) => (
            <li key={r._id} className="p-6 flex flex-col md:flex-row gap-5">
              {r.productId?.image && <img src={r.productId.image} alt="" className="w-16 h-20 object-cover rounded-lg bg-gray-100 shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <span className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4" fill={i <= r.rating ? 'currentColor' : 'none'} />)}
                  </span>
                  <span className="font-semibold text-gray-900">{r.title}</span>
                  {r.verified && <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"><BadgeCheck className="w-3.5 h-3.5" /> Verified buyer</span>}
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line">{r.comment}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {r.userName} · {r.userEmail} · {new Date(r.createdAt).toLocaleDateString('en-IN')} · {r.productId?.name || 'Deleted product'}
                </p>
              </div>
              <div className="flex md:flex-col gap-2 shrink-0">
                {r.status !== 'approved' && (
                  <button onClick={() => act(r._id, 'approve')} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700">
                    <Check className="w-4 h-4" /> Approve
                  </button>
                )}
                {r.status !== 'rejected' && (
                  <button onClick={() => act(r._id, 'reject')} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200">
                    <X className="w-4 h-4" /> Reject
                  </button>
                )}
                <button onClick={() => act(r._id, 'delete')} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-red-600 text-sm font-medium hover:bg-red-50">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminReviews;
