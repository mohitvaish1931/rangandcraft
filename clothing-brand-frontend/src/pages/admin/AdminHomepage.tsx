import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Info, MonitorSmartphone, Pencil, Plus, Trash2, Wand2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { API_ENDPOINTS, apiCall, fetchJSON } from '../../utils/api';
import { errorMessage } from '../../lib/format';
import { useToast } from '../../lib/toast';
import { categoriesOf } from '../../lib/catalog';
import { loadSlides, pickLooks, type Slide } from '../../lib/media';
import { getImageUrl } from '../../utils/mediaHelper';
import { Badge, Card, Drawer, EmptyState, Field, PageHeader, SkeletonRows, Switch } from '../../components/admin/ui';
import '../../styles/admin-homepage.css';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;
const LIMITS = { eyebrow: 60, title: 90, text: 220, ctaLabel: 30 };
const DEFAULT_TITLE = 'Jaipur prints,\n*everyday ease.*';

interface Values { eyebrow: string; title: string; text: string; ctaLabel: string; ctaLink: string; active: boolean }
const EMPTY: Values = { eyebrow: '', title: '', text: '', ctaLabel: '', ctaLink: '/shop', active: true };

const valuesOf = (s: Slide): Values => ({
  eyebrow: s.eyebrow || '', title: s.title || '', text: s.text || '',
  ctaLabel: s.ctaLabel || '', ctaLink: s.ctaLink || '/shop', active: s.active !== false,
});

const validate = (v: Values, needsPhoto: boolean, hasPhoto: boolean) => {
  const e: Partial<Record<keyof Values | 'photo', string>> = {};
  if (needsPhoto && !hasPhoto) e.photo = 'Choose a photo for the slide';
  (Object.keys(LIMITS) as (keyof typeof LIMITS)[]).forEach((k) => {
    if (v[k].length > LIMITS[k]) e[k] = `Keep it under ${LIMITS[k]} characters`;
  });
  if (v.ctaLink && !/^\/(?!\/)/.test(v.ctaLink) && !/^https:\/\//i.test(v.ctaLink)) e.ctaLink = 'Use a page on your store (starting with /) or a full https:// link';
  return e;
};

const formDataOf = (v: Values, file: File | null, order?: number) => {
  const fd = new FormData();
  (Object.keys(v) as (keyof Values)[]).forEach((k) => fd.append(k, String(v[k])));
  if (order !== undefined) fd.append('order', String(order));
  if (file) fd.append('image', file);
  return fd;
};

/** What the slide will look like on the storefront hero. */
const SlidePreview = ({ image, values, compact = false }: { image?: string; values: Values; compact?: boolean }) => {
  const title = (values.title || DEFAULT_TITLE).split('\n');
  return (
    <div className={`ad-hp-preview${compact ? ' is-compact' : ''}`} style={image ? { backgroundImage: `url("${image}")` } : undefined}>
      {!image && <span className="ad-hp-preview__empty"><ImagePlus aria-hidden /> Your photo appears here</span>}
      <div className="ad-hp-preview__copy">
        <span className="ad-hp-preview__eyebrow">{values.eyebrow || 'The Jaipur Edit'}</span>
        <strong className="ad-hp-preview__title">
          {title.map((line, i) => (
            <span key={i}>{line.split(/(\*[^*]+\*)/).map((part, j) => (part.startsWith('*') ? <em key={j}>{part.replace(/\*/g, '')}</em> : part))}</span>
          ))}
        </strong>
        {!compact && values.text && <span className="ad-hp-preview__text">{values.text}</span>}
        <span className="ad-hp-preview__btn">{values.ctaLabel || 'Shop the collection'}</span>
      </div>
    </div>
  );
};

interface FormProps {
  initial: Values;
  image?: string;
  submitLabel: string;
  needsPhoto: boolean;
  linkOptions: { value: string; label: string }[];
  onSubmit: (v: Values, file: File | null) => Promise<boolean>;
  idPrefix: string;
}

const SlideForm = ({ initial, image, submitLabel, needsPhoto, linkOptions, onSubmit, idPrefix }: FormProps) => {
  const [values, setValues] = useState<Values>(initial);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(image ? getImageUrl(image, 1200) : undefined);
  const [fileError, setFileError] = useState('');
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const preset = linkOptions.some((o) => o.value === values.ctaLink);
  const [custom, setCustom] = useState(!preset);

  useEffect(() => () => { if (file && preview?.startsWith('blob:')) URL.revokeObjectURL(preview); }, [file, preview]);

  const set = <K extends keyof Values>(k: K, v: Values[K]) => setValues((s) => ({ ...s, [k]: v }));
  const errors = validate(values, needsPhoto, Boolean(file || image));
  const shown = tried ? errors : {};

  const pick = (f?: File) => {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) return setFileError('Use a JPG, PNG or WebP photo');
    if (f.size > MAX_BYTES) return setFileError('That photo is over 10 MB. Export a smaller copy and try again.');
    setFileError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (Object.keys(errors).length || fileError) return;
    setSaving(true);
    const ok = await onSubmit({ ...values, title: values.title.trim(), text: values.text.trim() }, file);
    setSaving(false);
    if (ok && needsPhoto) {
      setValues(EMPTY);
      setFile(null);
      setPreview(undefined);
      setTried(false);
      setCustom(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="ad-hp-form">
      <SlidePreview image={preview} values={values} />

      <label
        htmlFor={`${idPrefix}-photo`}
        className={`ad-dropzone ad-hp-drop${dragOver ? ' is-over' : ''}${shown.photo || fileError ? ' is-invalid' : ''}`}
        onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); pick(e.dataTransfer.files?.[0]); }}
      >
        <ImagePlus aria-hidden />
        <strong>{preview ? 'Replace photo' : 'Add a photo'}</strong>
        <span>Wide photos work best (at least 1920 × 1080). On phones it’s cropped around the subject automatically.</span>
        <input id={`${idPrefix}-photo`} type="file" accept={ACCEPTED.join(',')} onChange={(e) => pick(e.target.files?.[0])} />
      </label>
      {(fileError || shown.photo) && <span className="ad-error-text" role="alert">{fileError || shown.photo}</span>}

      <div className="ad-form-grid" style={{ marginTop: 16 }}>
        <Field label="Small heading" htmlFor={`${idPrefix}-eyebrow`} optional error={shown.eyebrow} hint="Above the headline, e.g. “New season”.">
          <input id={`${idPrefix}-eyebrow`} className="ad-input" value={values.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} placeholder="The Jaipur Edit" />
        </Field>
        <Field label="Button text" htmlFor={`${idPrefix}-cta`} optional error={shown.ctaLabel}>
          <input id={`${idPrefix}-cta`} className="ad-input" value={values.ctaLabel} onChange={(e) => set('ctaLabel', e.target.value)} placeholder="Shop the collection" />
        </Field>
      </div>
      <Field label="Headline" htmlFor={`${idPrefix}-title`} optional error={shown.title} hint="Press Enter for a new line. Put *stars* around words to show them in gold italics.">
        <textarea id={`${idPrefix}-title`} className="ad-textarea" rows={2} value={values.title} onChange={(e) => set('title', e.target.value)} placeholder={DEFAULT_TITLE} />
      </Field>
      <Field label="Text" htmlFor={`${idPrefix}-text`} optional error={shown.text} hint={`${values.text.length}/${LIMITS.text}`}>
        <textarea id={`${idPrefix}-text`} className="ad-textarea" rows={2} value={values.text} onChange={(e) => set('text', e.target.value)} placeholder="Hand block printed cotton kurtas and shirts, made in Jaipur." />
      </Field>
      <Field label="Button goes to" htmlFor={`${idPrefix}-link`} error={shown.ctaLink}>
        <select
          id={`${idPrefix}-link`}
          className="ad-select"
          value={custom ? '__custom' : values.ctaLink}
          onChange={(e) => {
            if (e.target.value === '__custom') { setCustom(true); return; }
            setCustom(false);
            set('ctaLink', e.target.value);
          }}
        >
          {linkOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          <option value="__custom">Another page or link…</option>
        </select>
        {custom && (
          <input className="ad-input" style={{ marginTop: 8 }} value={values.ctaLink} onChange={(e) => set('ctaLink', e.target.value)} placeholder="/product/… or https://…" aria-label="Custom link" />
        )}
      </Field>
      <Switch checked={values.active} onChange={(v) => set('active', v)} label="Show on homepage" description="Turn off to keep the slide saved but hidden." />

      <button type="submit" className="ad-btn ad-btn--block" style={{ marginTop: 20 }} disabled={saving}>
        {saving ? <span className="ad-spinner" /> : needsPhoto ? <Plus aria-hidden /> : null} {saving ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
};

const AdminHomepage = () => {
  const { state } = useAppContext();
  const toast = useToast();
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<Slide | null>(null);

  const linkOptions = useMemo(() => [
    { value: '/shop', label: 'All products' },
    { value: '/shop?sort=newest', label: 'New arrivals' },
    { value: '/shop?sale=1', label: 'Sale' },
    ...categoriesOf(state.products).map((c) => ({ value: `/shop?category=${encodeURIComponent(c.name)}`, label: c.name })),
  ], [state.products]);
  const autoLooks = useMemo(() => pickLooks(state.products, 3), [state.products]);

  const fetchAll = () => fetchJSON<Slide[]>(`${API_ENDPOINTS.SLIDES}/all`);
  const showError = (err: unknown) => {
    setLoadError(errorMessage(err, 'Couldn’t load your slides.'));
    setSlides((s) => s ?? []);
  };

  const refresh = async () => {
    try {
      setSlides(await fetchAll());
      setLoadError('');
    } catch (err) {
      showError(err);
    }
    loadSlides(true); // so the storefront hero shows the change straight away
  };

  useEffect(() => {
    let alive = true;
    fetchAll().then((d) => alive && setSlides(d)).catch((err) => alive && showError(err));
    return () => { alive = false; };
  }, []);

  const list = slides ?? [];
  const live = list.filter((s) => s.active !== false);

  const create = async (v: Values, file: File | null) => {
    try {
      await fetchJSON<Slide>(API_ENDPOINTS.SLIDES, { method: 'POST', body: formDataOf(v, file, list.length) });
      toast.success(v.active ? 'Slide added to your homepage' : 'Slide saved (hidden)');
      await refresh();
      return true;
    } catch (err) {
      toast.error(errorMessage(err, 'Couldn’t save the slide'));
      return false;
    }
  };

  const update = async (s: Slide, v: Values, file: File | null) => {
    try {
      await fetchJSON<Slide>(`${API_ENDPOINTS.SLIDES}/${s._id}`, { method: 'PUT', body: formDataOf(v, file) });
      toast.success('Slide updated');
      setEditing(null);
      await refresh();
      return true;
    } catch (err) {
      toast.error(errorMessage(err, 'Couldn’t update the slide'));
      return false;
    }
  };

  const toggle = async (s: Slide) => {
    setBusy(s._id);
    try {
      await fetchJSON<Slide>(`${API_ENDPOINTS.SLIDES}/${s._id}`, { method: 'PUT', body: formDataOf({ ...valuesOf(s), active: s.active === false }, null) });
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const remove = async (s: Slide) => {
    if (!window.confirm(`Delete the slide “${s.title || s.eyebrow || 'untitled'}”? This can’t be undone.`)) return;
    setBusy(s._id);
    try {
      await apiCall(`${API_ENDPOINTS.SLIDES}/${s._id}`, { method: 'DELETE' });
      toast.success('Slide deleted');
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  // Saves the new position of every slide whose place changed.
  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    setSlides(next.map((s, i) => ({ ...s, order: i })));
    setBusy(list[index]._id);
    try {
      await Promise.all(next.map((s, i) => (s.order === i ? null : fetchJSON(`${API_ENDPOINTS.SLIDES}/${s._id}`, { method: 'PUT', body: formDataOf(valuesOf(s), null, i) }))));
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err, 'Couldn’t save the new order'));
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Homepage banner"
        description="The big banner at the top of your homepage. Add your own photos, or let it use your product photos automatically."
      />

      <Card title="Showing on your store now" description={live.length ? `A slideshow of ${live.length} slide${live.length === 1 ? '' : 's'}, changing every 7 seconds.` : 'Automatic: three of your product photos, changing daily.'}>
        {slides === null ? (
          <SkeletonRows rows={1} />
        ) : live.length ? (
          <div className="ad-hp-strip">
            {live.map((s) => <SlidePreview key={s._id} image={getImageUrl(s.image, 600)} values={valuesOf(s)} compact />)}
          </div>
        ) : (
          <>
            <div className="ad-hp-auto">
              {autoLooks.map((l) => <img key={l.src} src={getImageUrl(l.src, 400)} alt={l.product.name} loading="lazy" />)}
              {autoLooks.length === 0 && <p className="ad-hint">Add products with photos and they’ll appear here.</p>}
            </div>
            <div className="ad-alert ad-alert--info" style={{ marginTop: 16 }}>
              <Wand2 aria-hidden />
              <span>No slides yet, so the banner builds itself from in-stock products marked “Show on homepage”. Add a slide below to use your own photo and words instead.</span>
            </div>
          </>
        )}
        {loadError && <div className="ad-alert ad-alert--danger" style={{ marginTop: 16 }}><Info aria-hidden /><span>{loadError}</span></div>}
      </Card>

      <div className="ad-grid ad-grid--main" style={{ marginTop: 20 }}>
        <Card title="Your slides" description={list.length ? 'Shown in this order. Hidden slides stay saved but don’t appear.' : undefined} flush>
          {slides === null ? (
            <SkeletonRows rows={3} />
          ) : list.length === 0 ? (
            <EmptyState icon={MonitorSmartphone} title="No slides yet" text="Upload a wide photo, write a headline and choose where the button goes." />
          ) : (
            <ul className="ad-list ad-hp-list">
              {list.map((s, i) => (
                <li key={s._id} className={s.active === false ? 'is-hidden' : ''}>
                  <img src={getImageUrl(s.image, 320)} alt="" className="ad-hp-list__thumb" loading="lazy" />
                  <div className="ad-hp-list__body">
                    <strong>{(s.title || 'Default headline').replace(/\*/g, '').replace(/\n/g, ' ')}</strong>
                    <span>{s.ctaLabel || 'Shop the collection'} → {s.ctaLink || '/shop'}</span>
                    {s.active === false ? <Badge tone="neutral">Hidden</Badge> : <Badge tone="success">Live</Badge>}
                  </div>
                  <div className="ad-hp-list__actions">
                    <button type="button" className="ad-icon-btn" onClick={() => move(i, -1)} disabled={i === 0 || busy !== null} aria-label="Move up"><ArrowUp aria-hidden /></button>
                    <button type="button" className="ad-icon-btn" onClick={() => move(i, 1)} disabled={i === list.length - 1 || busy !== null} aria-label="Move down"><ArrowDown aria-hidden /></button>
                    <button type="button" className="ad-icon-btn" onClick={() => toggle(s)} disabled={busy !== null} aria-label={s.active === false ? 'Show on homepage' : 'Hide from homepage'}>
                      {s.active === false ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
                    </button>
                    <button type="button" className="ad-icon-btn" onClick={() => setEditing(s)} aria-label="Edit slide"><Pencil aria-hidden /></button>
                    <button type="button" className="ad-icon-btn is-danger" onClick={() => remove(s)} disabled={busy !== null} aria-label="Delete slide"><Trash2 aria-hidden /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div>
          <Card title="New slide" description="Everything except the photo is optional; blanks use the store’s default words.">
            <SlideForm idPrefix="new-slide" initial={EMPTY} submitLabel="Add slide" needsPhoto linkOptions={linkOptions} onSubmit={create} />
          </Card>
        </div>
      </div>

      {editing && (
        <Drawer title="Edit slide" onClose={() => setEditing(null)}>
          <SlideForm
            key={editing._id}
            idPrefix="edit-slide"
            initial={valuesOf(editing)}
            image={editing.image}
            submitLabel="Save changes"
            needsPhoto={false}
            linkOptions={linkOptions}
            onSubmit={(v, file) => update(editing, v, file)}
          />
        </Drawer>
      )}
    </>
  );
};

export default AdminHomepage;
