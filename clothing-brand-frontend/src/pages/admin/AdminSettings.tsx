import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Server, CreditCard, Database } from 'lucide-react';
import { API_ENDPOINTS, API_BASE_URL, fetchJSON } from '../../utils/api';

type Level = 'ok' | 'warn' | 'error';
interface Check { label: string; detail: string; level: Level; icon: typeof Server }

const ICON = { ok: CheckCircle2, warn: AlertTriangle, error: XCircle };
const COLOR = { ok: 'text-emerald-600', warn: 'text-amber-500', error: 'text-red-600' };

const AdminSettings = () => {
  const [checks, setChecks] = useState<Check[] | null>(null);

  useEffect(() => {
    Promise.allSettled([
      fetchJSON<{ status: string; db: string }>(API_ENDPOINTS.HEALTH),
      fetchJSON<{ enabled: boolean; mock: boolean; keyId: string | null }>(API_ENDPOINTS.PAYMENT.CONFIG),
    ]).then(([health, pay]) => {
      const h = health.status === 'fulfilled' ? health.value : null;
      const p = pay.status === 'fulfilled' ? pay.value : null;
      setChecks([
        { label: 'API server', icon: Server, detail: h ? `Reachable at ${API_BASE_URL}` : `Cannot reach ${API_BASE_URL}`, level: h ? 'ok' : 'error' },
        { label: 'Database', icon: Database, detail: h ? `MongoDB ${h.db}` : 'Unknown', level: h?.db === 'connected' ? 'ok' : 'error' },
        {
          label: 'Online payments',
          icon: CreditCard,
          detail: !p ? 'Unknown' : p.keyId ? `Razorpay ${p.keyId.startsWith('rzp_live') ? 'LIVE' : 'TEST'} mode (${p.keyId})` : p.mock ? 'Mock payments (development only — no money is collected)' : 'Not configured — customers cannot pay online. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the server.',
          level: !p ? 'error' : p.keyId?.startsWith('rzp_live') ? 'ok' : 'warn',
        },
      ]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Store Status</h1>
        <p className="text-sm text-gray-500 mt-1">Live checks of the services your store depends on. Configuration is managed through server environment variables.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-100">
        {!checks ? <p className="p-8 text-gray-400">Running checks…</p> : checks.map((c) => {
          const StatusIcon = ICON[c.level];
          return (
            <div key={c.label} className="p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0"><c.icon className="w-5 h-5" /></div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{c.label}</p>
                <p className="text-sm text-gray-500">{c.detail}</p>
              </div>
              <StatusIcon className={`w-5 h-5 ${COLOR[c.level]}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminSettings;
