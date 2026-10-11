import { useState } from 'react';
import { ArrowDown, ArrowUp, Info, Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAppContext, type Banner } from '../../context/AppContext';
import { API_ENDPOINTS, apiCall, postJSON } from '../../utils/api';
import { errorMessage } from '../../lib/format';
import { useToast } from '../../lib/toast';
import { ANNOUNCEMENTS } from '../../lib/brand';
import { Badge, Card, Drawer, EmptyState, Field, PageHeader, type Tone } from '../../components/admin/ui';
import '../../styles/admin-insights.css';

type BannerType = NonNullable<Banner['type']>;

const TYPES: { value: BannerType; label: string; tone: Tone; hint: string }[] = [
  { value: 'info', label: 'General info', tone: 'info', hint: 'Shipping, returns, store news' },
  { value: 'hot', label: 'Hot deal', tone: 'danger', hint: 'Sales and limited-time offers' },
  { value: 'new', label: 'New arrival', tone: 'gold', hint: 'Fresh drops and collections' },
  { value: 'sold-out', label: 'Notice', tone: 'neutral', hint: 'Sold-out alerts and other notices' },
];
const typeOf = (t?: string) => TYPES.find((x) => x.value === t) || TYPES[0];
const MAX = 80;
const bannerId = (b: Banner) => String(b._id || b.id);

const Preview = ({ text }: { text: string }) => (
  <div className="ad-insights-bar" aria-label="Preview">
    <span className={`ad-insights-bar__static${text.trim() ? '' : ' is-empty'}`}>{text.trim() || 'Your message will appear here'}</span>
  </div>
);

const AdminBanners = () => {
  const { state, dispatch } = useAppContext();
  const toast = useToast();
  const [text, setText] = useState('');
  const [type, setType] = useState<BannerType>('info');
  const [saving, setSaving] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<Banner | null>(null);

  const banners = state.banners;
  const textError = !text.trim() ? 'Write a short message' : text.length > MAX ? `Keep it under ${MAX} characters so it fits on phones` : '';

  const addBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (textError) return;
    setSaving(true);
    try {
      const b = await postJSON<Banner>(API_ENDPOINTS.BANNERS, { text: text.trim(), type });
      dispatch({ type: 'SET_BANNERS', payload: [b, ...state.banners] });
      setText('');
      setTried(false);
      toast.success('Announcement added');
    } catch (err) {
      toast.error(errorMessage(err, 'Couldn’t add the announcement'));
    } finally {
      setSaving(false);
    }
  };

  const deleteBanner = async (b: Banner) => {
    if (!window.confirm(`Delete “${b.text}”? This can’t be undone.`)) return;
    const id = bannerId(b);
    setBusy(id);
    try {
      await apiCall(`${API_ENDPOINTS.BANNERS}/${id}`, { method: 'DELETE' });
      dispatch({ type: 'SET_BANNERS', payload: state.banners.filter((x) => bannerId(x) !== id) });
      toast.success('Announcement deleted');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  // Saves the new position of every message whose place changed.
  const moveBanner = async (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= banners.length) return;
    const previous = banners;
    const next = [...banners];
    [next[index], next[target]] = [next[target], next[index]];
    dispatch({ type: 'SET_BANNERS', payload: next.map((b, i) => ({ ...b, order: i })) });
    const id = bannerId(banners[index]);
    setBusy(id);
    try {
      await Promise.all(next.map((b, i) => (
        (b as Banner & { order?: number }).order === i ? null
          : postJSON<Banner>(`${API_ENDPOINTS.BANNERS}/${bannerId(b)}`, { text: b.text, type: b.type, order: i }, 'PUT')
      )));
    } catch (err) {
      dispatch({ type: 'SET_BANNERS', payload: previous });
      toast.error(errorMessage(err, 'Couldn’t save the new order'));
    } finally {
      setBusy(null);
    }
  };

  const saveEdit = async (b: Banner, body: { text: string; type: BannerType }) => {
    try {
      const updated = await postJSON<Banner>(`${API_ENDPOINTS.BANNERS}/${bannerId(b)}`, { ...body, order: (b as Banner & { order?: number }).order }, 'PUT');
      dispatch({ type: 'SET_BANNERS', payload: state.banners.map((x) => (bannerId(x) === bannerId(b) ? { ...updated, id: updated._id || b.id } : x)) });
      toast.success('Announcement updated');
      setEditing(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const loop = [...ANNOUNCEMENTS, ...ANNOUNCEMENTS];

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Short messages for the scrolling bar at the very top of your store."
      />

      <Card
        title="Showing on your store now"
        description="The scrolling bar shoppers see above the menu on every page."
      >
        <div className="ad-insights-bar" aria-label="Live announcement bar">
          <div className="ad-insights-bar__track">
            {loop.map((t, i) => <span key={i} aria-hidden={i >= ANNOUNCEMENTS.length}>{t}</span>)}
          </div>
        </div>
        <div className="ad-alert ad-alert--info" style={{ marginTop: 16 }}>
          <Info aria-hidden />
          <span>
            These {ANNOUNCEMENTS.length} messages are built into the website. Messages you save below are stored safely but the bar
            doesn’t read them yet, so ask your developer to switch the bar over when you’re ready to manage it from here.
          </span>
        </div>
      </Card>

      <div className="ad-grid ad-grid--main" style={{ marginTop: 20 }}>
        <Card title="Saved messages" description={banners.length ? 'Shown in this order, top first.' : undefined} flush>
          {banners.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No saved messages yet"
              text="Write a message like “Free shipping above ₹1499” and it will be listed here."
            />
          ) : (
            <ul className="ad-list">
              {banners.map((b, i) => {
                const t = typeOf(b.type);
                const id = bannerId(b);
                return (
                  <li key={id} style={{ display: 'block' }}>
                    <div className="ad-insights-msg">
                      <Preview text={b.text} />
                      <div className="ad-insights-msg__actions">
                        <span className="ad-insights-msg__type"><Badge tone={t.tone}>{t.label}</Badge></span>
                        <button type="button" className="ad-icon-btn" onClick={() => moveBanner(i, 'up')} disabled={i === 0 || busy !== null} aria-label="Move up"><ArrowUp aria-hidden /></button>
                        <button type="button" className="ad-icon-btn" onClick={() => moveBanner(i, 'down')} disabled={i === banners.length - 1 || busy !== null} aria-label="Move down"><ArrowDown aria-hidden /></button>
                        <button type="button" className="ad-icon-btn" onClick={() => setEditing(b)} aria-label="Edit message"><Pencil aria-hidden /></button>
                        <button type="button" className="ad-icon-btn is-danger" onClick={() => deleteBanner(b)} disabled={busy === id} aria-label="Delete message"><Trash2 aria-hidden /></button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div>
        <Card title="New message" description="Keep it short: one line on a phone is about 40 characters.">
          <form onSubmit={addBanner} noValidate>
            <Field
              label="Message"
              htmlFor="banner-text"
              error={tried ? textError || undefined : undefined}
              hint={<span style={{ display: 'flex' }}>Plain words work best. No need for capitals, the bar adds them.<span className={`ad-insights-counter${text.length > MAX ? ' is-over' : ''}`}>{text.length}/{MAX}</span></span>}
            >
              <input id="banner-text" className="ad-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Free shipping on orders above ₹1499" />
            </Field>
            <Field label="Type" htmlFor="banner-type" hint={typeOf(type).hint}>
              <select id="banner-type" className="ad-select" value={type} onChange={(e) => setType(e.target.value as BannerType)}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <div className="ad-field">
              <span className="ad-label">Preview</span>
              <Preview text={text} />
            </div>
            <button type="submit" className="ad-btn ad-btn--block" style={{ marginTop: 20 }} disabled={saving}>
              {saving ? <span className="ad-spinner" /> : <Plus aria-hidden />} {saving ? 'Adding…' : 'Add message'}
            </button>
          </form>
        </Card>
        </div>
      </div>

      {editing && <EditDrawer key={bannerId(editing)} banner={editing} onClose={() => setEditing(null)} onSave={saveEdit} />}
    </>
  );
};

interface EditProps {
  banner: Banner;
  onClose: () => void;
  onSave: (b: Banner, body: { text: string; type: BannerType }) => Promise<void>;
}

const EditDrawer = ({ banner, onClose, onSave }: EditProps) => {
  const [text, setText] = useState(banner.text);
  const [type, setType] = useState<BannerType>(banner.type || 'info');
  const [saving, setSaving] = useState(false);
  const error = !text.trim() ? 'Write a short message' : text.length > MAX ? `Keep it under ${MAX} characters` : '';

  const submit = async () => {
    if (error) return;
    setSaving(true);
    await onSave(banner, { text: text.trim(), type });
    setSaving(false);
  };

  return (
    <Drawer
      title="Edit message"
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="ad-btn ad-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="ad-btn" onClick={submit} disabled={saving || Boolean(error)}>
            {saving && <span className="ad-spinner" />} Save changes
          </button>
        </>
      )}
    >
      <div>
        <Field label="Message" htmlFor="edit-banner-text" error={error || undefined} hint={`${text.length}/${MAX} characters`}>
          <input id="edit-banner-text" className="ad-input" value={text} onChange={(e) => setText(e.target.value)} />
        </Field>
        <Field label="Type" htmlFor="edit-banner-type" hint={typeOf(type).hint}>
          <select id="edit-banner-type" className="ad-select" value={type} onChange={(e) => setType(e.target.value as BannerType)}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
      </div>
      <div className="ad-field">
        <span className="ad-label">Preview</span>
        <Preview text={text} />
      </div>
    </Drawer>
  );
};

export default AdminBanners;
