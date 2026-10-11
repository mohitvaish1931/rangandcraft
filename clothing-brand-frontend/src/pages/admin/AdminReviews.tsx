import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BadgeCheck, Check, CheckCheck, ExternalLink, MessageSquareText, Trash2, X } from 'lucide-react';
import { API_ENDPOINTS, fetchJSON, apiCall } from '../../utils/api';
import { errorMessage, formatDate } from '../../lib/format';
import { useToast } from '../../lib/toast';
import { getImageUrl } from '../../utils/mediaHelper';
import { timeAgo } from '../../lib/adminFormat';
import { Stars } from '../../components/StarRating';
import { Badge, Card, EmptyState, PageHeader, SearchBox, SkeletonRows, Tabs } from '../../components/admin/ui';
import '../../styles/admin-people.css';

type Status = 'pending' | 'approved' | 'rejected';
type Action = 'approve' | 'reject' | 'delete';

interface AdminReview {
  _id: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  status: Status;
  verified?: boolean;
  images?: string[];
  createdAt: string;
  productId?: { _id: string; name: string; image?: string } | null;
}

type Lists = Record<Status, AdminReview[]>;

const TABS: { key: Status; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const TARGET: Record<Exclude<Action, 'delete'>, Status> = { approve: 'approved', reject: 'rejected' };

const EMPTY: Record<Status, { title: string; text: string }> = {
  pending: { title: 'You’re all caught up', text: 'New reviews from customers will wait here until you approve them.' },
  approved: { title: 'No published reviews yet', text: 'Reviews you approve show on the product page in your store.' },
  rejected: { title: 'No rejected reviews', text: 'Reviews you reject stay hidden from the store and are kept here.' },
};

const byNewest = (a: AdminReview, b: AdminReview) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

/** Takes the review out of its current list and, for approve/reject, puts it in the new one. */
const moveReview = (lists: Lists, r: AdminReview, action: Action): Lists => {
  const next: Lists = { ...lists, [r.status]: lists[r.status].filter((x) => x._id !== r._id) };
  if (action !== 'delete') {
    const to = TARGET[action];
    next[to] = [{ ...r, status: to }, ...next[to].filter((x) => x._id !== r._id)].sort(byNewest);
  }
  return next;
};

/** Undo a move after the server said no. */
const restoreReview = (lists: Lists, r: AdminReview, action: Action): Lists => {
  const next: Lists = { ...lists, [r.status]: [r, ...lists[r.status].filter((x) => x._id !== r._id)].sort(byNewest) };
  if (action !== 'delete') {
    const to = TARGET[action];
    if (to !== r.status) next[to] = next[to].filter((x) => x._id !== r._id);
  }
  return next;
};

const callApi = (id: string, action: Action) =>
  action === 'delete'
    ? apiCall(`${API_ENDPOINTS.REVIEWS}/${id}`, { method: 'DELETE' })
    : apiCall(`${API_ENDPOINTS.REVIEWS}/admin/${id}/${action}`, { method: 'PUT' });

const AdminReviews = () => {
  const toast = useToast();
  const { refreshSummary } = useOutletContext<{ refreshSummary?: () => void }>() ?? {};
  const [tab, setTab] = useState<Status>('pending');
  const [lists, setLists] = useState<Lists | null>(null);
  const [query, setQuery] = useState('');
  const [bulk, setBulk] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = (status: Status) =>
      fetchJSON<{ reviews: AdminReview[] }>(`${API_ENDPOINTS.REVIEWS}/admin/all?status=${status}`).then((d) => d.reviews);
    Promise.all(TABS.map((t) => load(t.key)))
      .then(([pending, approved, rejected]) => { if (alive) setLists({ pending, approved, rejected }); })
      .catch((err) => { if (alive) { toast.error(errorMessage(err)); setLists({ pending: [], approved: [], rejected: [] }); } });
    return () => { alive = false; };
  }, [toast]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (lists?.[tab] ?? []).filter((r) => !q || [r.title, r.comment, r.userName, r.userEmail, r.productId?.name]
      .some((v) => String(v || '').toLowerCase().includes(q)));
  }, [lists, tab, query]);

  const act = async (r: AdminReview, action: Action) => {
    if (action === 'delete' && !window.confirm(`Delete this review from ${r.userName} permanently? This can’t be undone.`)) return;
    setLists((l) => l && moveReview(l, r, action));
    try {
      await callApi(r._id, action);
      toast.success(action === 'approve' ? 'Review published on your store' : action === 'reject' ? (r.status === 'approved' ? 'Review hidden from your store' : 'Review rejected') : 'Review deleted');
      refreshSummary?.();
    } catch (err) {
      setLists((l) => l && restoreReview(l, r, action));
      toast.error(errorMessage(err));
    }
  };

  const approveAll = async () => {
    const batch = visible.filter((r) => r.status === 'pending');
    if (!batch.length || !window.confirm(`Publish all ${batch.length} reviews shown? They’ll appear on your product pages straight away.`)) return;
    setBulk(true);
    let done = 0;
    for (const r of batch) {
      try {
        await callApi(r._id, 'approve');
        setLists((l) => l && moveReview(l, r, 'approve'));
        done += 1;
      } catch { /* counted below */ }
    }
    setBulk(false);
    refreshSummary?.();
    if (done === batch.length) toast.success(`${done} review${done === 1 ? '' : 's'} published`);
    else toast.error(`Published ${done} of ${batch.length}. Please try the rest again.`);
  };

  const pending = lists?.pending.length ?? 0;

  return (
    <>
      <PageHeader
        title="Reviews"
        description={lists
          ? pending ? `${pending} review${pending === 1 ? '' : 's'} waiting for you. New reviews stay hidden from your store until you approve them.` : 'New reviews stay hidden from your store until you approve them.'
          : 'Loading reviews…'}
        actions={tab === 'pending' && visible.length > 1 ? (
          <button type="button" className="ad-btn" onClick={approveAll} disabled={bulk}>
            {bulk ? <span className="ad-spinner" /> : <CheckCheck aria-hidden />} Approve all {visible.length}
          </button>
        ) : undefined}
      />

      <div className="ad-toolbar">
        <Tabs label="Review status" value={tab} onChange={setTab} items={TABS.map((t) => ({ key: t.key, label: t.label, count: lists ? lists[t.key].length : undefined }))} />
        <div className="ad-toolbar__grow" />
        <SearchBox value={query} onChange={setQuery} placeholder="Product, customer or words" label="Search reviews" />
      </div>

      <Card flush>
        {lists === null ? <SkeletonRows /> : visible.length === 0 ? (
          <EmptyState
            icon={tab === 'pending' && !query ? Check : MessageSquareText}
            title={query ? 'No matching reviews' : EMPTY[tab].title}
            text={query ? 'Try a product name, customer name or a word from the review.' : EMPTY[tab].text}
            action={query ? <button type="button" className="ad-btn ad-btn--secondary" onClick={() => setQuery('')}>Clear search</button> : undefined}
          />
        ) : (
          <ul className="ad-people-reviews">
            {visible.map((r) => {
              const p = r.productId;
              return (
                <li key={r._id} className="ad-people-review">
                  {p ? (
                    <a className="ad-people-review__thumb" href={`/product/${p._id}`} target="_blank" rel="noreferrer" aria-label={`Open ${p.name} in your store`}>
                      <img src={getImageUrl(p.image, 120)} alt="" loading="lazy" />
                    </a>
                  ) : <span className="ad-people-review__thumb" aria-hidden />}

                  <div style={{ minWidth: 0 }}>
                    <div className="ad-people-review__head">
                      <Stars value={r.rating} size={15} />
                      <span className="ad-people-review__title">{r.title}</span>
                    </div>
                    <p className="ad-people-review__body">{r.comment}</p>
                    {r.images && r.images.length > 0 && (
                      <div className="ad-people-review__photos">
                        {r.images.map((src, i) => (
                          <a key={i} href={getImageUrl(src)} target="_blank" rel="noreferrer" aria-label={`Open customer photo ${i + 1}`}>
                            <img src={getImageUrl(src, 160)} alt="" loading="lazy" />
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="ad-people-review__meta">
                      <span>
                        <strong style={{ fontWeight: 500, color: 'var(--ad-ink-2)' }}>{r.userName}</strong>
                        {r.userEmail && <> · <a href={`mailto:${r.userEmail}`} style={{ fontWeight: 400 }}>{r.userEmail}</a></>}
                      </span>
                      {r.verified && <Badge tone="success" plain><BadgeCheck size={13} aria-hidden /> Verified buyer</Badge>}
                      <span title={formatDate(r.createdAt)}>{timeAgo(r.createdAt)}</span>
                      {p
                        ? <a href={`/product/${p._id}`} target="_blank" rel="noreferrer">{p.name} <ExternalLink aria-hidden /></a>
                        : <span>Product no longer in store</span>}
                    </div>
                  </div>

                  <div className="ad-people-review__actions">
                    {r.status !== 'approved' && (
                      <button type="button" className="ad-btn ad-btn--sm" onClick={() => act(r, 'approve')} disabled={bulk}><Check aria-hidden /> Approve</button>
                    )}
                    {r.status !== 'rejected' && (
                      <button type="button" className="ad-btn ad-btn--secondary ad-btn--sm" onClick={() => act(r, 'reject')} disabled={bulk}>
                        <X aria-hidden /> {r.status === 'approved' ? 'Unpublish' : 'Reject'}
                      </button>
                    )}
                    <button type="button" className="ad-btn ad-btn--danger ad-btn--sm" onClick={() => act(r, 'delete')} disabled={bulk}><Trash2 aria-hidden /> Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
};

export default AdminReviews;
