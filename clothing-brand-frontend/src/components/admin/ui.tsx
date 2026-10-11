import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowLeft, ArrowUpRight, Search, X, type LucideIcon } from 'lucide-react';

/* ---------- Layout ---------- */

interface PageHeaderProps {
  title: ReactNode;
  eyebrow?: string;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { to: string; label: string };
}

export const PageHeader = ({ title, eyebrow, description, actions, back }: PageHeaderProps) => (
  <header className="ad-page-head">
    <div style={{ minWidth: 0 }}>
      {back && <Link to={back.to} className="ad-back"><ArrowLeft aria-hidden /> {back.label}</Link>}
      {eyebrow && <div className="ad-page-head__eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    {actions && <div className="ad-page-head__actions">{actions}</div>}
  </header>
);

interface CardProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  flush?: boolean;
  className?: string;
  children: ReactNode;
}

export const Card = ({ title, description, actions, footer, flush, className = '', children }: CardProps) => (
  <section className={`ad-card ${className}`}>
    {(title || actions) && (
      <div className="ad-card__head">
        <div>
          {title && <h2>{title}</h2>}
          {description && <p>{description}</p>}
        </div>
        {actions}
      </div>
    )}
    <div className={`ad-card__body${flush ? ' ad-card__body--flush' : ''}`}>{children}</div>
    {footer && <div className="ad-card__foot">{footer}</div>}
  </section>
);

/* ---------- Data display ---------- */

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'gold' | 'neutral';

export const Badge = ({ tone = 'neutral', plain, children }: { tone?: Tone; plain?: boolean; children: ReactNode }) => (
  <span className={`ad-badge${tone !== 'neutral' ? ` ad-badge--${tone}` : ''}${plain ? ' ad-badge--plain' : ''}`}>{children}</span>
);

export const Delta = ({ value }: { value: number | null }) => {
  if (value === null || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  const kind = rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'flat';
  const Icon = rounded > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`ad-delta ad-delta--${kind}`}>
      {kind !== 'flat' && <Icon size={12} aria-hidden />}
      {Math.abs(rounded)}%
    </span>
  );
};

interface StatProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: 'brand' | 'gold';
  delta?: number | null;
  meta?: ReactNode;
  spark?: number[];
}

export const Stat = ({ label, value, icon: Icon, tone = 'brand', delta, meta, spark }: StatProps) => (
  <div className="ad-stat">
    <div className="ad-stat__top">
      <span className="ad-stat__label">{label}</span>
      <span className={`ad-stat__icon${tone === 'gold' ? ' ad-stat__icon--gold' : ''}`}><Icon aria-hidden /></span>
    </div>
    <div className="ad-stat__value">{value}</div>
    {(delta !== undefined || meta) && (
      <div className="ad-stat__meta">
        {delta !== undefined && <Delta value={delta} />}
        {meta}
      </div>
    )}
    {spark && spark.length > 1 && <Sparkline data={spark} color={tone === 'gold' ? 'var(--ad-gold)' : 'var(--ad-brand)'} />}
  </div>
);

export const Sparkline = ({ data, color = 'var(--ad-brand)' }: { data: number[]; color?: string }) => {
  const id = useId();
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => [(i / (data.length - 1)) * 100, 36 - (v / max) * 32] as const);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  return (
    <svg className="ad-spark" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L100,40 L0,40 Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

interface ChartPoint { label: string; value: number; detail?: string }

/** Area chart with gridlines, axis labels and a hover tooltip. */
export const AreaChart = ({ data, format, height = 240 }: { data: ChartPoint[]; format: (n: number) => string; height?: number }) => {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(600);
  // Draw at the real pixel width so text stays crisp and readable on phones.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const H = height;
  const pad = { top: 12, right: 8, bottom: 26, left: 56 };
  const rawMax = Math.max(...data.map((d) => d.value), 0);
  const step = niceStep(rawMax / 4);
  const max = Math.max(step * 4, 1);
  const x = (i: number) => pad.left + (data.length === 1 ? (W - pad.left - pad.right) / 2 : (i / (data.length - 1)) * (W - pad.left - pad.right));
  const y = (v: number) => pad.top + (1 - v / max) * (H - pad.top - pad.bottom);
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ');
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(W / 80))));
  const last = data.length - 1;
  const showLabel = (i: number) => i === last || (i % labelEvery === 0 && last - i >= Math.ceil(labelEvery / 2));

  const onMove = (e: React.MouseEvent) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box || !data.length) return;
    const px = ((e.clientX - box.left) / box.width) * W;
    let best = 0;
    data.forEach((_, i) => { if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i; });
    setHover(best);
  };

  return (
    <div className="ad-chart" ref={ref} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Chart">
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1f4645" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#1f4645" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((k) => (
          <g key={k}>
            <line x1={pad.left} x2={W - pad.right} y1={y(step * k)} y2={y(step * k)} stroke="#ebe6dd" strokeDasharray={k ? '3 4' : undefined} />
            <text x={pad.left - 10} y={y(step * k) + 4} textAnchor="end" fontSize="11" fill="#a39a8e">{format(step * k)}</text>
          </g>
        ))}
        {data.length > 0 && <path d={`${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#${id})`} />}
        {data.length > 0 && <path d={line} fill="none" stroke="#1f4645" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
        {data.map((d, i) => showLabel(i) && (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill="#a39a8e">{d.label}</text>
        ))}
        {hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={y(0)} stroke="#1f4645" strokeOpacity="0.25" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="5" fill="#fff" stroke="#1f4645" strokeWidth="2" />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div className="ad-chart__tip" style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(data[hover].value) / H) * 100}%` }}>
          <strong>{format(data[hover].value)}</strong>
          {data[hover].detail || data[hover].label}
        </div>
      )}
    </div>
  );
};

const niceStep = (raw: number) => {
  if (raw <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow;
};

/* ---------- Navigation & inputs ---------- */

interface TabsProps<K extends string> {
  items: { key: K; label: string; count?: number }[];
  value: K;
  onChange: (key: K) => void;
  label: string;
}

export const Tabs = <K extends string>({ items, value, onChange, label }: TabsProps<K>) => (
  <div className="ad-tabs" role="tablist" aria-label={label}>
    {items.map((t) => (
      <button key={t.key} type="button" role="tab" className="ad-tab" aria-selected={value === t.key} onClick={() => onChange(t.key)}>
        {t.label}
        {t.count !== undefined && <span className="ad-tab__count">{t.count}</span>}
      </button>
    ))}
  </div>
);

export const SearchBox = ({ value, onChange, placeholder, label = 'Search' }: { value: string; onChange: (v: string) => void; placeholder: string; label?: string }) => (
  <label className="ad-searchbox">
    <span className="rc-sr-only">{label}</span>
    <Search aria-hidden />
    <input className="ad-input" type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  </label>
);

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
  children: ReactNode;
}

export const Field = ({ label, htmlFor, hint, error, optional, className = '', children }: FieldProps) => (
  <div className={`ad-field ${className}`}>
    <label className="ad-label" htmlFor={htmlFor}>{label}{optional && <small>optional</small>}</label>
    {children}
    {error ? <span className="ad-error-text" role="alert">{error}</span> : hint && <span className="ad-hint">{hint}</span>}
  </div>
);

export const Switch = ({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) => (
  <label className="ad-switch">
    <div>
      <strong>{label}</strong>
      {description && <span>{description}</span>}
    </div>
    <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <i aria-hidden />
  </label>
);

/* ---------- Feedback ---------- */

export const EmptyState = ({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text?: ReactNode; action?: ReactNode }) => (
  <div className="ad-empty">
    <span className="ad-empty__icon"><Icon aria-hidden /></span>
    <strong>{title}</strong>
    {text && <p>{text}</p>}
    {action}
  </div>
);

export const SkeletonRows = ({ rows = 5 }: { rows?: number }) => (
  <div style={{ padding: 20, display: 'grid', gap: 14 }} aria-busy="true" aria-label="Loading">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <span className="ad-skel" style={{ width: 40, height: 48 }} />
        <span style={{ flex: 1, display: 'grid', gap: 8 }}>
          <span className="ad-skel" style={{ height: 12, width: `${55 + ((i * 13) % 30)}%` }} />
          <span className="ad-skel" style={{ height: 10, width: '30%' }} />
        </span>
        <span className="ad-skel" style={{ height: 22, width: 80, borderRadius: 999 }} />
      </div>
    ))}
  </div>
);

interface DrawerProps {
  title: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

export const Drawer = ({ title, description, onClose, footer, children }: DrawerProps) => {
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <>
      <div className="ad-overlay" onClick={onClose} aria-hidden />
      <aside ref={panelRef} tabIndex={-1} className="ad-drawer" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
        <div className="ad-drawer__head">
          <div>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button type="button" className="ad-icon-btn" onClick={onClose} aria-label="Close"><X aria-hidden /></button>
        </div>
        <div className="ad-drawer__body">{children}</div>
        {footer && <div className="ad-drawer__foot">{footer}</div>}
      </aside>
    </>
  );
};
