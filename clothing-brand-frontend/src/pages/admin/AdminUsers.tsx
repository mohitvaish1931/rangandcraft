import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { API_ENDPOINTS, fetchJSON } from '../../utils/api';
import type { AdminUser } from '../../lib/adminTypes';
import { errorMessage, formatDate } from '../../lib/format';
import { useToast } from '../../lib/toast';
import { initials, timeAgo } from '../../lib/adminFormat';
import { Badge, Card, EmptyState, PageHeader, SearchBox, SkeletonRows, Tabs } from '../../components/admin/ui';
import '../../styles/admin-people.css';

type TabKey = 'all' | 'admins' | 'customers';

const TABS: { key: TabKey; label: string; test: (u: AdminUser) => boolean }[] = [
  { key: 'all', label: 'All', test: () => true },
  { key: 'admins', label: 'Admins', test: (u) => u.isAdmin },
  { key: 'customers', label: 'Customers', test: (u) => !u.isAdmin },
];

const AdminUsers = () => {
  const toast = useToast();
  const { state } = useAppContext();
  const me = state.user;
  const navigate = useNavigate();
  const profile = (u: AdminUser) => `/admin/customers?open=${encodeURIComponent(u.email.toLowerCase())}`;
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [tab, setTab] = useState<TabKey>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchJSON<AdminUser[]>(API_ENDPOINTS.USERS)
      .then(setUsers)
      .catch((err) => { toast.error(errorMessage(err)); setUsers([]); });
  }, [toast]);

  const isMe = (u: AdminUser) => Boolean(me && (u._id === (me._id || me.id) || u.email.toLowerCase() === me.email?.toLowerCase()));

  const counts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.key, (users ?? []).filter(t.test).length])) as Record<TabKey, number>,
    [users],
  );

  const visible = useMemo(() => {
    const t = TABS.find((x) => x.key === tab)!;
    const q = query.trim().toLowerCase();
    return (users ?? [])
      .filter(t.test)
      .filter((u) => !q || [u.name, u.email, u.phone].some((v) => String(v || '').toLowerCase().includes(q)))
      // Admins first, then newest accounts.
      .sort((a, b) => Number(b.isAdmin) - Number(a.isAdmin) || new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }, [users, tab, query]);

  return (
    <>
      <PageHeader
        title="Users & roles"
        description={users ? `${users.length} account${users.length === 1 ? '' : 's'} · ${counts.admins} with admin access` : 'Loading accounts…'}
      />

      <div className="ad-alert ad-alert--info" style={{ marginBottom: 16 }}>
        <ShieldCheck aria-hidden />
        <span>
          Admins can open this panel and see every order. For safety, admin access is given or removed on the server, not from this page.
          Ask your developer if someone needs it changed.
        </span>
      </div>

      <div className="ad-toolbar">
        <Tabs label="Filter accounts" value={tab} onChange={setTab} items={TABS.map((t) => ({ key: t.key, label: t.label, count: counts[t.key] ?? 0 }))} />
        <div className="ad-toolbar__grow" />
        <SearchBox value={query} onChange={setQuery} placeholder="Name, email or phone" label="Search accounts" />
      </div>

      <Card flush>
        {users === null ? <SkeletonRows /> : visible.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title={query ? 'No matching accounts' : 'No accounts here'}
            text={query ? 'Try a different name or email.' : 'Accounts appear here when people sign up on your store.'}
            action={query ? <button type="button" className="ad-btn ad-btn--secondary" onClick={() => setQuery('')}>Clear search</button> : undefined}
          />
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table ad-table--stack">
              <thead>
                <tr><th>Account</th><th>Phone</th><th>Role</th><th>Joined</th><th className="actions"><span className="rc-sr-only">Actions</span></th></tr>
              </thead>
              <tbody>
                {visible.map((u) => (
                  <tr key={u._id} className="is-clickable" onClick={() => navigate(profile(u))}>
                    <td className="is-primary">
                      <div className="ad-people-who">
                        <span className={`ad-avatar${u.isAdmin ? '' : ' ad-avatar--soft'}`} aria-hidden>{initials(u.name)}</span>
                        <span>
                          <strong>{u.name}{isMe(u) && <span className="ad-people-you">You</span>}</strong>
                          <small>{u.email}</small>
                        </span>
                      </div>
                    </td>
                    <td data-label="Phone" className={`muted${u.phone ? '' : ' ad-people-hide-sm'}`}>{u.phone || '—'}</td>
                    <td data-label="Role">
                      {u.isAdmin
                        ? <Badge tone="brand">Admin</Badge>
                        : <Badge>Customer</Badge>}
                    </td>
                    <td data-label="Joined" className="muted" title={u.createdAt ? formatDate(u.createdAt) : undefined}>{u.createdAt ? timeAgo(u.createdAt) : '—'}</td>
                    <td className="actions ad-people-hide-sm">
                      <Link className="ad-icon-btn" to={profile(u)} onClick={(e) => e.stopPropagation()} aria-label={`View ${u.name}’s orders`} title="View customer profile">
                        <UserRound aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
};

export default AdminUsers;
