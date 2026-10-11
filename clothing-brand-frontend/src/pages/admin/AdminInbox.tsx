import { useEffect, useMemo, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Download, Inbox, Mail, MailPlus, Phone, Reply, Trash2 } from 'lucide-react';
import { API_ENDPOINTS, apiCall, fetchJSON, postJSON } from '../../utils/api';
import { errorMessage, formatDate, slugToTitle } from '../../lib/format';
import { useToast } from '../../lib/toast';
import { initials, timeAgo } from '../../lib/adminFormat';
import { Badge, Card, Drawer, EmptyState, Field, PageHeader, SearchBox, SkeletonRows, Tabs, type Tone } from '../../components/admin/ui';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import '../../styles/admin-people.css';

type Status = 'new' | 'replied' | 'closed';

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: Status;
  createdAt: string;
}
interface Subscriber { _id: string; email: string; source: string; createdAt: string }
interface InboxData { inquiries: Inquiry[]; subscribers: Subscriber[] }

type View = 'messages' | 'subscribers';
type StatusFilter = 'all' | Status;

const STATUS: Record<Status, { label: string; tone: Tone }> = {
  new: { label: 'New', tone: 'warning' },
  replied: { label: 'Replied', tone: 'info' },
  closed: { label: 'Closed', tone: 'neutral' },
};

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'replied', label: 'Replied' },
  { key: 'closed', label: 'Closed' },
];

// Same topics as the store's contact form.
const TOPICS: Record<string, string> = {
  order: 'Order, delivery or exchange',
  sizing: 'Sizing & styling help',
  wholesale: 'Wholesale / franchise',
  custom: 'Custom or bulk orders',
  other: 'Something else',
  general: 'General question',
};
const topicLabel = (s: string) => TOPICS[s] || slugToTitle(s || 'general');
const sourceLabel = (s: string) => slugToTitle(s || 'website');

const AdminInbox = () => {
  const toast = useToast();
  const { refreshSummary } = useOutletContext<{ refreshSummary?: () => void }>() ?? {};
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<InboxData | null>(null);
  const [view, setView] = useState<View>(params.get('tab') === 'subscribers' ? 'subscribers' : 'messages');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const openId = params.get('open');

  useEffect(() => {
    fetchJSON<InboxData>(API_ENDPOINTS.CONTACT)
      .then(setData)
      .catch((err) => { toast.error(errorMessage(err)); setData({ inquiries: [], subscribers: [] }); });
  }, [toast]);

  const counts = useMemo(() => {
    const list = data?.inquiries ?? [];
    const n = (s: Status) => list.filter((i) => i.status === s).length;
    return { all: list.length, new: n('new'), replied: n('replied'), closed: n('closed') } as Record<StatusFilter, number>;
  }, [data]);

  const q = query.trim().toLowerCase();
  const messages = useMemo(
    () => (data?.inquiries ?? [])
      .filter((m) => filter === 'all' || m.status === filter)
      .filter((m) => !q || [m.name, m.email, m.phone, m.message, topicLabel(m.subject)].some((v) => String(v || '').toLowerCase().includes(q))),
    [data, filter, q],
  );
  const subscribers = useMemo(
    () => (data?.subscribers ?? []).filter((s) => !q || [s.email, s.source].some((v) => String(v || '').toLowerCase().includes(q))),
    [data, q],
  );

  const setOpen = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set('open', id); else next.delete('open');
    setParams(next, { replace: true });
  };

  const setStatus = async (id: string, status: Status) => {
    try {
      const updated = await postJSON<Inquiry>(`${API_ENDPOINTS.CONTACT}/${id}`, { status }, 'PUT');
      setData((d) => d && { ...d, inquiries: d.inquiries.map((i) => (i._id === id ? updated : i)) });
      toast.success(`Marked as ${STATUS[status].label.toLowerCase()}`);
      refreshSummary?.();
      return true;
    } catch (err) {
      toast.error(errorMessage(err));
      return false;
    }
  };

  const remove = async (m: Inquiry) => {
    if (!window.confirm(`Delete the message from ${m.name}? This can’t be undone.`)) return false;
    try {
      await apiCall(`${API_ENDPOINTS.CONTACT}/${m._id}`, { method: 'DELETE' });
      setData((d) => d && { ...d, inquiries: d.inquiries.filter((i) => i._id !== m._id) });
      toast.success('Message deleted');
      refreshSummary?.();
      return true;
    } catch (err) {
      toast.error(errorMessage(err));
      return false;
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

  const switchView = (v: View) => {
    setView(v);
    setQuery('');
  };

  const open = data?.inquiries.find((m) => m._id === openId) || null;

  return (
    <>
      <PageHeader
        title="Inbox"
        description={data
          ? `${counts.new ? `${counts.new} new message${counts.new === 1 ? '' : 's'} · ` : ''}Contact-form messages and newsletter sign-ups from your store.`
          : 'Loading your inbox…'}
        actions={view === 'subscribers' ? (
          <button type="button" className="ad-btn ad-btn--secondary" onClick={exportCsv} disabled={!data?.subscribers.length}><Download aria-hidden /> Export CSV</button>
        ) : undefined}
      />

      <div className="ad-toolbar">
        <Tabs
          label="Inbox section"
          value={view}
          onChange={switchView}
          items={[
            { key: 'messages', label: 'Messages', count: data ? data.inquiries.length : undefined },
            { key: 'subscribers', label: 'Subscribers', count: data ? data.subscribers.length : undefined },
          ]}
        />
        <div className="ad-toolbar__grow" />
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder={view === 'messages' ? 'Name, email or words' : 'Email or source'}
          label={view === 'messages' ? 'Search messages' : 'Search subscribers'}
        />
      </div>

      {view === 'messages' ? (
        <>
          <div className="ad-chips" role="group" aria-label="Filter by status" style={{ marginBottom: 14 }}>
            {FILTERS.map((f) => (
              <button key={f.key} type="button" className={`ad-chip${filter === f.key ? ' is-on' : ''}`} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
                {f.label}<span style={{ opacity: 0.7 }}>{counts[f.key]}</span>
              </button>
            ))}
          </div>
          <Card flush>
            {!data ? <SkeletonRows /> : messages.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title={q ? 'No matching messages' : filter === 'new' ? 'No new messages' : filter === 'all' ? 'No messages yet' : `No ${filter} messages`}
                text={q
                  ? 'Try a different name, email or word.'
                  : filter === 'new' ? 'You’re all caught up. New messages from the contact form will land here.' : 'Messages sent through the Contact page of your store appear here.'}
                action={q ? <button type="button" className="ad-btn ad-btn--secondary" onClick={() => setQuery('')}>Clear search</button> : undefined}
              />
            ) : (
              <ul className="ad-people-msgs">
                {messages.map((m) => (
                  <li key={m._id}>
                    <button type="button" className={`ad-people-msg${m.status === 'new' ? ' is-new' : ''}`} onClick={() => setOpen(m._id)}>
                      <span className={`ad-avatar${m.status === 'new' ? '' : ' ad-avatar--soft'}`} aria-hidden>{initials(m.name)}</span>
                      <span className="ad-people-msg__main">
                        <span className="ad-people-msg__top">
                          <strong>{m.name}</strong>
                          <span className="ad-people-msg__time" title={formatDate(m.createdAt)}>{timeAgo(m.createdAt)}</span>
                        </span>
                        <span className="ad-people-msg__tags">
                          <Badge tone={STATUS[m.status].tone}>{STATUS[m.status].label}</Badge>
                          <Badge plain>{topicLabel(m.subject)}</Badge>
                        </span>
                        <span className="ad-people-msg__preview">{m.message}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      ) : (
        <Card flush>
          {!data ? <SkeletonRows /> : subscribers.length === 0 ? (
            <EmptyState
              icon={MailPlus}
              title={q ? 'No matching subscribers' : 'No subscribers yet'}
              text={q ? 'Try a different email.' : 'People who sign up for your newsletter in the store footer or pop-up appear here.'}
              action={q ? <button type="button" className="ad-btn ad-btn--secondary" onClick={() => setQuery('')}>Clear search</button> : undefined}
            />
          ) : (
            <div className="ad-table-wrap">
              <table className="ad-table ad-table--stack">
                <thead><tr><th>Email</th><th>Signed up from</th><th>Date</th></tr></thead>
                <tbody>
                  {subscribers.map((s) => (
                    <tr key={s._id}>
                      <td className="is-primary">
                        <a className="ad-link" href={`mailto:${s.email}`} style={{ overflowWrap: 'anywhere' }}>{s.email}</a>
                      </td>
                      <td data-label="Signed up from"><Badge plain>{sourceLabel(s.source)}</Badge></td>
                      <td data-label="Date" className="muted" title={formatDate(s.createdAt)}>{timeAgo(s.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {open && <MessageDrawer key={open._id} message={open} onClose={() => setOpen(null)} onStatus={setStatus} onDelete={remove} />}
    </>
  );
};

interface DrawerProps {
  message: Inquiry;
  onClose: () => void;
  onStatus: (id: string, status: Status) => Promise<boolean>;
  onDelete: (m: Inquiry) => Promise<boolean>;
}

const MessageDrawer = ({ message: m, onClose, onStatus, onDelete }: DrawerProps) => {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const topic = topicLabel(m.subject);
  const first = m.name.split(' ')[0] || '';
  const phone = (m.phone || '').replace(/\D/g, '').slice(-10);
  const quoted = m.message.split('\n').map((l) => `> ${l}`).join('\n');
  const mailto = `mailto:${m.email}?subject=${encodeURIComponent(`Re: ${topic}`)}&body=${encodeURIComponent(`Hi ${first},\n\n\n\nWarm regards,\nRang and Craft\n\n${quoted}`)}`;

  const changeStatus = async (status: Status) => {
    setSaving(true);
    await onStatus(m._id, status);
    setSaving(false);
  };

  const del = async () => {
    setDeleting(true);
    const ok = await onDelete(m);
    setDeleting(false);
    if (ok) onClose();
  };

  return (
    <Drawer
      title={m.name}
      description={<>{topic} · {formatDate(m.createdAt)}</>}
      onClose={onClose}
      footer={(
        <div className="ad-people-foot">
          <button type="button" className="ad-btn ad-btn--danger" onClick={del} disabled={deleting}>
            {deleting ? <span className="ad-spinner" /> : <Trash2 aria-hidden />} Delete
          </button>
          <div className="ad-people-foot__grow" />
          {phone.length === 10 && (
            <a className="ad-btn ad-btn--secondary" href={`https://wa.me/91${phone}?text=${encodeURIComponent(`Hi ${first}, this is Rang and Craft replying to your message.`)}`} target="_blank" rel="noreferrer" aria-label="Reply on WhatsApp">
              <WhatsAppIcon width={15} height={15} /> WhatsApp
            </a>
          )}
          <a className="ad-btn" href={mailto}><Reply aria-hidden /> Reply by email</a>
        </div>
      )}
    >
      <section>
        <div className="ad-section-title">Message</div>
        <div className="ad-boxed ad-people-message">{m.message}</div>
        <p className="ad-hint" style={{ marginTop: 8 }}>Received {timeAgo(m.createdAt)}</p>
      </section>

      <section>
        <div className="ad-section-title"><Mail aria-hidden /> From</div>
        <dl className="ad-kv">
          <div><dt>Name</dt><dd>{m.name}</dd></div>
          <div><dt>Email</dt><dd style={{ minWidth: 0, overflowWrap: 'anywhere' }}><a className="ad-link" href={`mailto:${m.email}`}>{m.email}</a></dd></div>
          <div><dt>Phone</dt><dd>{m.phone ? <a className="ad-link" href={`tel:${m.phone}`}><Phone aria-hidden /> {m.phone}</a> : '—'}</dd></div>
          <div><dt>Topic</dt><dd>{topic}</dd></div>
        </dl>
      </section>

      <section>
        <Field label="Status" htmlFor="msg-status" hint="Mark it replied once you’ve answered, or closed when there’s nothing more to do.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select id="msg-status" className="ad-select" value={m.status} disabled={saving} onChange={(e) => changeStatus(e.target.value as Status)}>
              {(Object.keys(STATUS) as Status[]).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
            </select>
            {saving && <span className="ad-spinner" style={{ color: 'var(--ad-muted)' }} aria-label="Saving" />}
          </div>
        </Field>
      </section>
    </Drawer>
  );
};

export default AdminInbox;
