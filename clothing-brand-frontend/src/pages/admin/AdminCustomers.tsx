import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { IndianRupee, Mail, MapPin, Phone, Repeat2, ShoppingBag, UserPlus, Users } from 'lucide-react';
import { API_ENDPOINTS, fetchJSON } from '../../utils/api';
import { orderUserId, type AdminOrder, type AdminUser } from '../../lib/adminTypes';
import { errorMessage, formatDate, shortOrderId } from '../../lib/format';
import { getImageUrl } from '../../utils/mediaHelper';
import { useToast } from '../../lib/toast';
import { initials, inr, isPaid, orderItems, orderStatus, orderTotal, timeAgo } from '../../lib/adminFormat';
import { Badge, Card, Drawer, EmptyState, PageHeader, SearchBox, SkeletonRows, Stat, Tabs, type Tone } from '../../components/admin/ui';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import '../../styles/admin-people.css';

interface Customer {
  key: string;
  name: string;
  email: string;
  phone: string;
  user: AdminUser | null;
  /** Newest first. */
  orders: AdminOrder[];
  paidOrders: number;
  spent: number;
  lastOrderAt?: string;
  firstSeen?: string;
  /** First signed up or ordered in the last 30 days. */
  isNew?: boolean;
  address?: AdminOrder['shippingAddress'];
}

type TabKey = 'all' | 'repeat' | 'registered' | 'guests';
type SortKey = 'recent' | 'spent' | 'orders' | 'newest';

const TABS: { key: TabKey; label: string; test: (c: Customer) => boolean }[] = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'repeat', label: 'Repeat', test: (c) => c.paidOrders >= 2 },
  { key: 'registered', label: 'Registered', test: (c) => Boolean(c.user) },
  { key: 'guests', label: 'Guests', test: (c) => !c.user },
];

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recent activity' },
  { key: 'spent', label: 'Highest spend' },
  { key: 'orders', label: 'Most orders' },
  { key: 'newest', label: 'Newest first' },
];

const time = (iso?: string) => (iso ? new Date(iso).getTime() : 0);
const digits10 = (phone?: string) => (phone || '').replace(/\D/g, '').slice(-10);
const DAY = 86_400_000;

const kind = (c: Customer): { label: string; tone: Tone } =>
  c.user?.isAdmin ? { label: 'Admin', tone: 'brand' } : c.user ? { label: 'Registered', tone: 'info' } : { label: 'Guest', tone: 'neutral' };

/** One row per person: registered accounts plus anyone who checked out as a guest (matched by email). */
const buildCustomers = (users: AdminUser[], orders: AdminOrder[]): Customer[] => {
  const byKey = new Map<string, Customer>();
  const byId = new Map<string, Customer>();
  for (const u of users) {
    const c: Customer = {
      key: (u.email || u._id).toLowerCase(), name: u.name || u.email, email: u.email, phone: '', user: u,
      orders: [], paidOrders: 0, spent: 0, firstSeen: u.createdAt,
    };
    byKey.set(c.key, c);
    byId.set(u._id, c);
  }
  const sorted = [...orders].sort((a, b) => time(b.createdAt) - time(a.createdAt));
  for (const o of sorted) {
    const a = o.shippingAddress || {};
    const populated = o.user && typeof o.user === 'object' ? o.user : null;
    const email = (a.email || populated?.email || '').trim().toLowerCase();
    const uid = orderUserId(o);
    let c = (uid && byId.get(uid)) || (email ? byKey.get(email) : undefined);
    if (!c) {
      const phone = digits10(a.phoneNumber);
      const key = email || (phone ? `tel:${phone}` : '');
      if (!key) continue;
      c = { key, name: a.name || a.fullName || email || 'Guest', email, phone: '', user: null, orders: [], paidOrders: 0, spent: 0 };
      byKey.set(key, c);
    }
    c.orders.push(o);
    if (isPaid(o)) { c.paidOrders += 1; c.spent += orderTotal(o); }
  }
  const monthAgo = Date.now() - 30 * DAY;
  return [...byKey.values()].map((c) => {
    const latest = c.orders[0];
    const oldest = c.orders[c.orders.length - 1];
    const firstSeen = [c.firstSeen, oldest?.createdAt].filter(Boolean).sort((x, y) => time(x) - time(y))[0];
    return {
      ...c,
      phone: c.orders.find((o) => o.shippingAddress?.phoneNumber)?.shippingAddress?.phoneNumber || c.user?.phone || '',
      address: c.orders.find((o) => o.shippingAddress?.address)?.shippingAddress,
      lastOrderAt: latest?.createdAt,
      firstSeen,
      isNew: time(firstSeen) >= monthAgo,
    };
  });
};

const AdminCustomers = () => {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<{ users: AdminUser[]; orders: AdminOrder[] } | null>(null);
  const [tab, setTab] = useState<TabKey>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [query, setQuery] = useState('');
  const openKey = params.get('open');

  useEffect(() => {
    Promise.all([
      fetchJSON<AdminUser[]>(API_ENDPOINTS.USERS).catch((err) => { toast.error(errorMessage(err)); return [] as AdminUser[]; }),
      fetchJSON<AdminOrder[]>(API_ENDPOINTS.ORDERS.BASE).catch((err) => { toast.error(errorMessage(err)); return [] as AdminOrder[]; }),
    ]).then(([users, orders]) => setData({ users, orders }));
  }, [toast]);

  const customers = useMemo(() => (data ? buildCustomers(data.users, data.orders) : null), [data]);

  const stats = useMemo(() => {
    const list = customers ?? [];
    const buyers = list.filter((c) => c.paidOrders > 0);
    const repeat = buyers.filter((c) => c.paidOrders >= 2).length;
    const spent = buyers.reduce((s, c) => s + c.spent, 0);
    return {
      total: list.length,
      registered: list.filter((c) => c.user).length,
      guests: list.filter((c) => !c.user).length,
      buyers: buyers.length,
      repeat,
      repeatPct: buyers.length ? Math.round((repeat / buyers.length) * 100) : null,
      spent,
      avg: buyers.length ? spent / buyers.length : 0,
      fresh: list.filter((c) => c.isNew).length,
    };
  }, [customers]);

  const counts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.key, (customers ?? []).filter(t.test).length])) as Record<TabKey, number>,
    [customers],
  );

  const visible = useMemo(() => {
    const t = TABS.find((x) => x.key === tab)!;
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    const list = (customers ?? []).filter(t.test).filter((c) => !q
      || c.name.toLowerCase().includes(q)
      || c.email.toLowerCase().includes(q)
      || (qDigits.length >= 3 && c.phone.replace(/\D/g, '').includes(qDigits)));
    const by: Record<SortKey, (a: Customer, b: Customer) => number> = {
      recent: (a, b) => Math.max(time(b.lastOrderAt), time(b.firstSeen)) - Math.max(time(a.lastOrderAt), time(a.firstSeen)),
      spent: (a, b) => b.spent - a.spent || b.paidOrders - a.paidOrders,
      orders: (a, b) => b.paidOrders - a.paidOrders || b.spent - a.spent,
      newest: (a, b) => time(b.firstSeen) - time(a.firstSeen),
    };
    return [...list].sort(by[sort]);
  }, [customers, tab, query, sort]);

  const setOpen = (key: string | null) => {
    const next = new URLSearchParams(params);
    if (key) next.set('open', key); else next.delete('open');
    setParams(next, { replace: true });
  };

  const open = customers?.find((c) => c.key === openKey?.toLowerCase()) || null;

  return (
    <>
      <PageHeader
        title="Customers"
        description={customers ? `${stats.total} people have signed up or ordered from your store.` : 'Loading customers…'}
      />

      <div className="ad-grid ad-grid--stats" style={{ marginBottom: 20 }}>
        <Stat label="Customers" icon={Users} value={customers ? stats.total : '–'} meta={customers ? `${stats.registered} registered · ${stats.guests} guest${stats.guests === 1 ? '' : 's'}` : undefined} />
        <Stat
          label="Repeat customers"
          icon={Repeat2}
          tone="gold"
          value={stats.repeatPct === null ? '–' : `${stats.repeatPct}%`}
          meta={customers ? (stats.buyers ? `${stats.repeat} of ${stats.buyers} buyers ordered again` : 'No paid orders yet') : undefined}
        />
        <Stat label="Average lifetime spend" icon={IndianRupee} value={customers ? inr(stats.avg) : '–'} meta={customers ? `${inr(stats.spent)} from ${stats.buyers} buyer${stats.buyers === 1 ? '' : 's'}` : undefined} />
        <Stat label="New in last 30 days" icon={UserPlus} tone="gold" value={customers ? stats.fresh : '–'} meta={customers ? 'First signed up or ordered' : undefined} />
      </div>

      <div className="ad-toolbar">
        <Tabs label="Filter customers" value={tab} onChange={setTab} items={TABS.map((t) => ({ key: t.key, label: t.label, count: counts[t.key] ?? 0 }))} />
        <div className="ad-toolbar__grow" />
        <label className="ad-people-sort">
          <span className="rc-sr-only">Sort customers</span>
          <select className="ad-select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>
        <SearchBox value={query} onChange={setQuery} placeholder="Name, email or phone" label="Search customers" />
      </div>

      <Card flush>
        {customers === null ? <SkeletonRows /> : visible.length === 0 ? (
          <EmptyState
            icon={Users}
            title={query ? 'No matching customers' : customers.length ? 'No one here yet' : 'No customers yet'}
            text={query
              ? 'Try a different name, email or phone number.'
              : customers.length
                ? tab === 'repeat' ? 'Customers who place a second paid order will show up here.' : 'Try another tab.'
                : 'When someone creates an account or places an order, they’ll appear here.'}
            action={query ? <button type="button" className="ad-btn ad-btn--secondary" onClick={() => setQuery('')}>Clear search</button> : undefined}
          />
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table ad-table--stack">
              <thead>
                <tr>
                  <th>Customer</th><th>Phone</th><th className="num">Orders</th><th className="num">Total spent</th><th>Last order</th><th>Joined</th><th>Type</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => {
                  const k = kind(c);
                  return (
                    <tr key={c.key} className="is-clickable" onClick={() => setOpen(c.key)}>
                      <td className="is-primary">
                        <button type="button" className="ad-people-who" onClick={(e) => { e.stopPropagation(); setOpen(c.key); }}>
                          <span className="ad-avatar ad-avatar--soft" aria-hidden>{initials(c.name)}</span>
                          <span>
                            <strong>{c.name}</strong>
                            <small>{c.email || 'No email'}</small>
                          </span>
                        </button>
                      </td>
                      <td data-label="Phone" className="muted ad-people-hide-sm">{c.phone || '—'}</td>
                      <td data-label="Orders" className="num">{c.paidOrders}</td>
                      <td data-label="Total spent" className="num"><span style={{ fontWeight: 500 }}>{inr(c.spent)}</span></td>
                      <td data-label="Last order" className="muted" title={c.lastOrderAt ? formatDate(c.lastOrderAt) : undefined}>{c.lastOrderAt ? timeAgo(c.lastOrderAt) : 'No orders'}</td>
                      <td data-label="Joined" className="muted ad-people-hide-sm">{c.firstSeen ? formatDate(c.firstSeen) : '—'}</td>
                      <td data-label="Type"><Badge tone={k.tone}>{k.label}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {open && <CustomerDrawer key={open.key} customer={open} onClose={() => setOpen(null)} />}
    </>
  );
};

const CustomerDrawer = ({ customer: c, onClose }: { customer: Customer; onClose: () => void }) => {
  const k = kind(c);
  const phone = digits10(c.phone);
  const first = c.name.split(' ')[0] || '';
  const a = c.address;
  const unpaid = c.orders.length - c.paidOrders;

  return (
    <Drawer
      title={c.name}
      description={<><Badge tone={k.tone}>{k.label}</Badge>{c.firstSeen ? ` · Customer since ${formatDate(c.firstSeen)}` : ''}</>}
      onClose={onClose}
    >
      <div className="ad-people-mini">
        <div><span>Total spent</span><strong>{inr(c.spent)}</strong></div>
        <div><span>Paid orders</span><strong>{c.paidOrders}</strong></div>
        <div><span>Average order</span><strong>{c.paidOrders ? inr(c.spent / c.paidOrders) : '—'}</strong></div>
      </div>

      <section>
        <div className="ad-section-title"><Mail aria-hidden /> Contact</div>
        <dl className="ad-kv">
          <div><dt>Email</dt><dd style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{c.email ? <a className="ad-link" href={`mailto:${c.email}`}>{c.email}</a> : '—'}</dd></div>
          <div><dt>Phone</dt><dd>{c.phone ? <a className="ad-link" href={`tel:${c.phone}`}>{c.phone}</a> : '—'}</dd></div>
          {c.lastOrderAt && <div><dt>Last order</dt><dd>{timeAgo(c.lastOrderAt)}</dd></div>}
        </dl>
        {(c.email || phone.length === 10) && (
          <div className="ad-people-actions">
            {c.email && (
              <a className="ad-btn ad-btn--secondary ad-btn--sm" href={`mailto:${c.email}?subject=${encodeURIComponent('Hello from Rang and Craft')}&body=${encodeURIComponent(`Hi ${first},\n\n`)}`}>
                <Mail aria-hidden /> Email
              </a>
            )}
            {phone.length === 10 && (
              <>
                <a className="ad-btn ad-btn--secondary ad-btn--sm" href={`https://wa.me/91${phone}?text=${encodeURIComponent(`Hi ${first}, this is Rang and Craft.`)}`} target="_blank" rel="noreferrer">
                  <WhatsAppIcon width={15} height={15} /> WhatsApp
                </a>
                <a className="ad-btn ad-btn--secondary ad-btn--sm" href={`tel:${c.phone}`}><Phone aria-hidden /> Call</a>
              </>
            )}
          </div>
        )}
      </section>

      {a?.address && (
        <section>
          <div className="ad-section-title"><MapPin aria-hidden /> Latest delivery address</div>
          <div className="ad-boxed" style={{ whiteSpace: 'pre-line' }}>
            {[a.name, a.address, `${a.city ?? ''}${a.postalCode ? ` – ${a.postalCode}` : ''}`].filter(Boolean).join('\n')}
          </div>
        </section>
      )}

      <section>
        <div className="ad-section-title"><ShoppingBag aria-hidden /> Orders{c.orders.length ? ` (${c.orders.length})` : ''}</div>
        {c.orders.length === 0 ? (
          <div className="ad-boxed" style={{ color: 'var(--ad-muted)' }}>{first || 'This customer'} hasn’t placed an order yet.</div>
        ) : (
          <>
            <ul className="ad-people-orders">
              {c.orders.map((o) => {
                const st = orderStatus(o);
                const items = orderItems(o);
                const qty = items.reduce((s, i) => s + (i.qty ?? i.quantity ?? 1), 0);
                return (
                  <li key={o._id}>
                    <Link to={`/admin/orders?open=${o._id}`}>
                      <img className="ad-list__thumb" src={getImageUrl(items[0]?.image, 100)} alt="" />
                      <span className="ad-list__main">
                        <strong>{shortOrderId(o._id)}</strong>
                        <span>{formatDate(o.createdAt)} · {qty} item{qty === 1 ? '' : 's'}</span>
                      </span>
                      <span className="ad-people-orders__end">
                        <strong>{inr(orderTotal(o))}</strong>
                        <Badge tone={st.tone}>{st.label}</Badge>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {unpaid > 0 && <p className="ad-hint" style={{ marginTop: 8 }}>Includes {unpaid} unpaid checkout{unpaid === 1 ? '' : 's'}, not counted in their spend.</p>}
          </>
        )}
      </section>
    </Drawer>
  );
};

export default AdminCustomers;
