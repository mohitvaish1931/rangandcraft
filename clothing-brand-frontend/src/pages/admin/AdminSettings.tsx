import { useCallback, useEffect, useState } from 'react';
import {
  CreditCard, Database, Gift, ImageUp, KeyRound, Mail, MapPin, Phone, RefreshCw, Server,
} from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL, fetchJSON } from '../../utils/api';
import { BUNDLE_OFFERS, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '../../lib/offers';
import {
  MAPS_URL, BUSINESS_ADDRESS, STORE_NAME, SUPPORT_EMAIL, SUPPORT_PHONE, WHATSAPP_NUMBER, WHATSAPP_URL,
} from '../../lib/brand';
import { inr } from '../../lib/adminFormat';
import { Badge, Card, PageHeader } from '../../components/admin/ui';
import WhatsAppIcon from '../../components/WhatsAppIcon';
import '../../styles/admin-insights.css';

type Level = 'ok' | 'warn' | 'error';
interface Check { label: string; detail: string; level: Level; icon: typeof Server }

const BADGE: Record<Level, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  ok: { label: 'Operational', tone: 'success' },
  warn: { label: 'Needs attention', tone: 'warning' },
  error: { label: 'Needs attention', tone: 'danger' },
};

const ENV_GROUPS = [
  { label: 'Payments', names: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'] },
  { label: 'Email', names: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'ADMIN_NOTIFY_EMAIL'] },
  { label: 'Image uploads', names: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'] },
  { label: 'Admin login', names: ['ADMIN_EMAIL', 'ADMIN_PASSWORD'] },
];

interface UploadsCheck { ok: boolean; configured: boolean; status?: number; message: string; cloudName?: string; apiKey?: string }

const uploadHint = (u: UploadsCheck) => {
  const m = u.message.toLowerCase();
  if (u.status === 401 || /api_key|api key|signature|cloud_name/.test(m)) return 'The cloud name, API key or secret on Render doesn’t match Cloudinary → Settings → API Keys.';
  if (/ip|address/.test(m)) return 'This API key only allows certain IP addresses. Remove the IP restriction in Cloudinary → Settings → API Keys.';
  if (/permission|not allowed|restricted|role/.test(m)) return 'This API key isn’t allowed to upload. Use a key with upload (or full) access from Cloudinary → Settings → API Keys.';
  if (/disabled|suspend|limit|quota|exceed|plan/.test(m)) return 'Your Cloudinary account is disabled or over its limits. Check the banner on the Cloudinary dashboard.';
  return 'Check the API key in Cloudinary → Settings → API Keys and the account status on the dashboard.';
};

const runChecks = async (): Promise<Check[]> => {
  const [health, pay, uploads] = await Promise.allSettled([
    fetchJSON<{ status: string; db: string }>(API_ENDPOINTS.HEALTH),
    fetchJSON<{ enabled: boolean; mock: boolean; keyId: string | null }>(API_ENDPOINTS.PAYMENT.CONFIG),
    fetchJSON<UploadsCheck>(API_ENDPOINTS.ADMIN_UPLOADS_CHECK),
  ]);
  const h = health.status === 'fulfilled' ? health.value : null;
  const p = pay.status === 'fulfilled' ? pay.value : null;
  const u = uploads.status === 'fulfilled' ? uploads.value : null;
  return [
    { label: 'Store server', icon: Server, detail: h ? `Online and answering at ${API_BASE_URL}` : `Can’t reach ${API_BASE_URL}. The store may be starting up; check again in a minute.`, level: h ? 'ok' : 'error' },
    { label: 'Database', icon: Database, detail: h ? (h.db === 'connected' ? 'Connected. Products, orders and customers are being saved.' : `MongoDB is ${h.db}. Orders can’t be saved until it reconnects.`) : 'Unknown, because the server can’t be reached.', level: h?.db === 'connected' ? 'ok' : 'error' },
    {
      label: 'Online payments',
      icon: CreditCard,
      detail: !p ? 'Unknown, because the server can’t be reached.'
        : p.keyId ? `Razorpay in ${p.keyId.startsWith('rzp_live') ? 'live mode: real payments are being collected' : 'test mode: no real money is collected yet'} (key ${p.keyId}).`
          : p.mock ? 'Practice payments only (development). No money is collected.'
            : 'Not set up. Customers can’t pay online until RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are added.',
      level: !p ? 'error' : p.keyId?.startsWith('rzp_live') ? 'ok' : 'warn',
    },
    {
      label: 'Image uploads',
      icon: ImageUp,
      detail: !u ? 'Couldn’t run the test. Make sure the server is up to date, then check again.'
        : u.ok ? `Cloudinary is connected (cloud ${u.cloudName}, key ${u.apiKey}). Product photos will upload.`
          : !u.configured ? u.message
            : `Cloudinary refused a test upload${u.status ? ` (${u.status})` : ''}: “${u.message}”${u.cloudName ? ` — cloud ${u.cloudName}, key ${u.apiKey}` : ''}. ${uploadHint(u)}`,
      level: u?.ok ? 'ok' : 'error',
    },
  ];
};

const AdminSettings = () => {
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const load = useCallback(() => runChecks().then((list) => { setChecks(list); setCheckedAt(new Date()); }), []);
  useEffect(() => { void load(); }, [load]);

  const recheck = () => { setChecks(null); void load(); };
  const problems = checks?.filter((c) => c.level !== 'ok').length ?? 0;

  return (
    <>
      <PageHeader
        title="Store status"
        description="Live checks of the services your store depends on, plus the rules and contact details customers see."
        actions={(
          <button type="button" className="ad-btn ad-btn--secondary" onClick={recheck} disabled={!checks}>
            {checks ? <RefreshCw aria-hidden /> : <span className="ad-spinner" />} Check again
          </button>
        )}
      />

      <div className="ad-grid ad-grid--main">
        <div className="ad-stack">
          <Card
            title="Services"
            description={checks && checkedAt ? `Checked at ${checkedAt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}` : 'Running checks…'}
            actions={checks && (problems ? <Badge tone="warning">{problems} need{problems === 1 ? 's' : ''} attention</Badge> : <Badge tone="success">All operational</Badge>)}
            footer={checks && problems > 0 ? (
              <span className="ad-hint">
                {checks.some((c) => c.level === 'error')
                  ? 'If a service stays down for more than a few minutes, open your server on Render and check its logs.'
                  : 'The store works, but fix the item marked “Needs attention” before you take real orders.'}
              </span>
            ) : undefined}
            flush
          >
            <ul className="ad-list" aria-busy={!checks}>
              {!checks ? [0, 1, 2].map((i) => (
                <li key={i} className="ad-insights-status">
                  <span className="ad-skel" style={{ width: 40, height: 40, borderRadius: 11 }} />
                  <div className="ad-list__main" style={{ display: 'grid', gap: 8 }}>
                    <span className="ad-skel" style={{ height: 12, width: '30%' }} />
                    <span className="ad-skel" style={{ height: 10, width: '65%' }} />
                  </div>
                  <span className="ad-skel" style={{ height: 24, width: 100, borderRadius: 999 }} />
                </li>
              )) : checks.map((c) => (
                <li key={c.label} className="ad-insights-status">
                  <span className={`ad-insights-status-icon${c.level === 'ok' ? '' : c.level === 'warn' ? ' is-warn' : ' is-error'}`}><c.icon aria-hidden /></span>
                  <div className="ad-list__main">
                    <strong>{c.label}</strong>
                    <span>{c.detail}</span>
                  </div>
                  <Badge tone={BADGE[c.level].tone}>{BADGE[c.level].label}</Badge>
                </li>
              ))}
            </ul>
          </Card>

          <div className="ad-alert ad-alert--info">
            <KeyRound aria-hidden />
            <div style={{ minWidth: 0 }}>
              <strong style={{ fontWeight: 600 }}>Where integrations are set up</strong>
              <p style={{ marginTop: 2 }}>
                Payments, email, image uploads and the admin login are configured in Render → your server → Environment.
                After changing a value there, Render restarts the store automatically. These are the setting names:
              </p>
              <div className="ad-insights-envs">
                {ENV_GROUPS.map((g) => (
                  <div key={g.label}>
                    <strong>{g.label}</strong>
                    {g.names.map((n) => <code key={n} className="ad-insights-code">{n}</code>)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="ad-stack">
          <Card title="Shipping & offers" description="Applied automatically at checkout.">
            <dl className="ad-kv">
              <div><dt>Shipping fee</dt><dd>{inr(SHIPPING_FEE)}</dd></div>
              <div className="is-good"><dt>Free shipping from</dt><dd>{inr(FREE_SHIPPING_THRESHOLD)}</dd></div>
            </dl>
            <p className="ad-hint" style={{ margin: '8px 0 16px' }}>Measured after bundle savings, before coupons.</p>
            <div className="ad-label" style={{ marginBottom: 10 }}>Bundle offers</div>
            {BUNDLE_OFFERS.map((o) => (
              <div key={o.id} className="ad-insights-offer">
                <span className="ad-insights-status-icon" style={{ width: 34, height: 34 }}><Gift aria-hidden /></span>
                <div style={{ minWidth: 0 }}>
                  <strong>{o.label}</strong>
                  <span>Any {o.size} {o.noun}s for {inr(o.price)}. Can’t be combined with coupons on the same items.</span>
                </div>
              </div>
            ))}
            <p className="ad-hint" style={{ marginTop: 14 }}>These rules are built into the website and server. Ask your developer to change them.</p>
          </Card>

          <Card title="Contact details" description="How customers reach you from the store." flush>
            <ul className="ad-list">
              <li>
                <span className="ad-insights-status-icon" style={{ width: 34, height: 34 }}><Phone aria-hidden /></span>
                <div className="ad-list__main"><span>Phone</span><strong><a href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`} className="ad-link">{SUPPORT_PHONE}</a></strong></div>
              </li>
              <li>
                <span className="ad-insights-status-icon" style={{ width: 34, height: 34 }}><Mail aria-hidden /></span>
                <div className="ad-list__main"><span>Email</span><strong><a href={`mailto:${SUPPORT_EMAIL}`} className="ad-link" style={{ display: 'inline' }}>{SUPPORT_EMAIL}</a></strong></div>
              </li>
              <li>
                <span className="ad-insights-status-icon" style={{ width: 34, height: 34 }}><WhatsAppIcon /></span>
                <div className="ad-list__main"><span>WhatsApp</span><strong><a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="ad-link">+{WHATSAPP_NUMBER.slice(0, 2)} {WHATSAPP_NUMBER.slice(2, 7)} {WHATSAPP_NUMBER.slice(7)}</a></strong></div>
              </li>
              <li>
                <span className="ad-insights-status-icon" style={{ width: 34, height: 34 }}><MapPin aria-hidden /></span>
                <div className="ad-list__main"><span>Store address</span><strong><a href={MAPS_URL} target="_blank" rel="noreferrer" className="ad-link" style={{ display: 'inline', whiteSpace: 'normal' }}>{STORE_NAME}, {BUSINESS_ADDRESS}</a></strong></div>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;
