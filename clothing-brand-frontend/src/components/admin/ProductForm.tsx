import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { ImagePlus, Star, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { categoryOptions, sizesOf } from '../../lib/catalog';
import { discountPercent, errorMessage } from '../../lib/format';
import { inr } from '../../lib/adminFormat';
import { useToast } from '../../lib/toast';
import { getImageUrl } from '../../utils/mediaHelper';
import { Badge, Card, Field, Switch } from './ui';
import '../../styles/admin-products.css';

interface Values {
  name: string;
  description: string;
  category: string;
  price: string;
  originalPrice: string;
  stock: string;
  sizes: string[];
  colors: string[];
  materials: string;
  specifications: string;
  careInstructions: string;
  soldOut: boolean;
  isBOGO: boolean;
  showOnHomepage: boolean;
  images: string[];
}

type ErrorKey = 'name' | 'description' | 'category' | 'photos' | 'price' | 'originalPrice' | 'stock';

interface NewPhoto { file: File; url: string }

interface ProductFormProps {
  /** Starting values; anything left out starts empty (homepage visibility starts on). */
  initial?: Partial<Values>;
  submitLabel: string;
  /** Receives the multipart body the products API expects; throw to show an error. */
  onSubmit: (body: FormData) => Promise<void>;
  onCancel: () => void;
  /** Extra content under the save buttons, e.g. a delete button. */
  aside?: ReactNode;
}

const EMPTY: Values = {
  name: '', description: '', category: '', price: '', originalPrice: '', stock: '',
  sizes: [], colors: [], materials: '', specifications: '', careInstructions: '',
  soldOut: false, isBOGO: false, showOnHomepage: true, images: [],
};

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_NEW = 10; // the API accepts up to 10 uploads per request
const LOW_STOCK = 3;
const COMMON_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL'];

const lines = (text: string) => text.split('\n').map((s) => s.trim()).filter(Boolean);
const isWhole = (s: string) => /^\d+$/.test(s.trim());

const validate = (v: Values, photoCount: number) => {
  const e: Partial<Record<ErrorKey, string>> = {};
  if (!v.name.trim()) e.name = 'Give the product a name.';
  if (!v.description.trim()) e.description = 'Add a short description so customers know what they’re buying.';
  if (!v.category) e.category = 'Choose a category.';
  if (photoCount === 0) e.photos = 'Add at least one photo.';
  const price = Number(v.price);
  if (!v.price.trim()) e.price = 'Enter a price.';
  else if (!Number.isFinite(price) || price <= 0) e.price = 'Price must be more than ₹0.';
  if (v.originalPrice.trim()) {
    const mrp = Number(v.originalPrice);
    if (!Number.isFinite(mrp) || mrp < 0) e.originalPrice = 'Enter a valid amount.';
    else if (mrp > 0 && Number.isFinite(price) && mrp < price) e.originalPrice = 'MRP should be the same as or higher than the price.';
  }
  if (!v.stock.trim()) e.stock = 'Enter how many you have (0 if none).';
  else if (!isWhole(v.stock)) e.stock = 'Use a whole number, like 12.';
  return e;
};

const ORDER: ErrorKey[] = ['name', 'description', 'category', 'photos', 'price', 'originalPrice', 'stock'];
const FIELD_ID: Record<ErrorKey, string> = {
  name: 'pf-name', description: 'pf-description', category: 'pf-category', photos: 'pf-photos',
  price: 'pf-price', originalPrice: 'pf-mrp', stock: 'pf-stock',
};

const ProductForm = ({ initial, submitLabel, onSubmit, onCancel, aside }: ProductFormProps) => {
  const toast = useToast();
  const { state } = useAppContext();
  const [start] = useState<Values>(() => ({ ...EMPTY, ...initial }));
  const [values, setValues] = useState<Values>(start);
  const [added, setAdded] = useState<NewPhoto[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }));

  const photoCount = values.images.length + added.length;
  const errors = submitted ? validate(values, photoCount) : {};
  const dirty = added.length > 0 || JSON.stringify(values) !== JSON.stringify(start);

  // Free the in-memory previews when leaving the page.
  const urlsRef = useRef<string[]>([]);
  useEffect(() => { urlsRef.current = added.map((p) => p.url); }, [added]);
  useEffect(() => () => urlsRef.current.forEach((u) => URL.revokeObjectURL(u)), []);

  // Warn before closing the tab with unsaved work.
  useEffect(() => {
    if (!dirty || saving) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, saving]);

  const categories = useMemo(() => categoryOptions(state.products, start.category), [state.products, start.category]);
  const sizeIdeas = useMemo(() => [...new Set([...COMMON_SIZES, ...sizesOf(state.products)])].slice(0, 10), [state.products]);
  const colourIdeas = useMemo(() => {
    const counts = new Map<string, number>();
    state.products.flatMap((p) => p.colors || []).forEach((c) => { const k = c.trim(); if (k) counts.set(k, (counts.get(k) || 0) + 1); });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c).slice(0, 8);
  }, [state.products]);

  /* ----- Photos ----- */
  const addFiles = (list: FileList | File[]) => {
    const files = Array.from(list);
    const ok = files.filter((f) => ACCEPTED.includes(f.type) && f.size <= MAX_BYTES);
    const rejected = files.length - ok.length;
    if (rejected) toast.error(`${rejected} file${rejected === 1 ? ' was' : 's were'} skipped. Use JPG, PNG or WebP photos under 10 MB.`);
    const room = MAX_NEW - added.length;
    if (ok.length > room) toast.error(`You can add up to ${MAX_NEW} new photos at a time. Save, then add the rest.`);
    const take = ok.slice(0, Math.max(0, room));
    if (take.length) setAdded((prev) => [...prev, ...take.map((file) => ({ file, url: URL.createObjectURL(file) }))]);
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const removeExisting = (i: number) => set('images', values.images.filter((_, idx) => idx !== i));
  const removeAdded = (i: number) => {
    URL.revokeObjectURL(added[i].url);
    setAdded((prev) => prev.filter((_, idx) => idx !== i));
  };
  const coverExisting = (i: number) => set('images', [values.images[i], ...values.images.filter((_, idx) => idx !== i)]);
  const coverAdded = (i: number) => setAdded((prev) => [prev[i], ...prev.filter((_, idx) => idx !== i)]);

  /* ----- Submit ----- */
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const problems = validate(values, photoCount);
    const first = ORDER.find((k) => problems[k]);
    if (first) {
      toast.error('Please fix the highlighted fields.');
      const el = document.getElementById(FIELD_ID[first]);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus({ preventScroll: true });
      return;
    }

    const fd = new FormData();
    fd.append('name', values.name.trim());
    fd.append('category', values.category);
    fd.append('price', values.price.trim());
    fd.append('originalPrice', values.originalPrice.trim());
    fd.append('stock', values.stock.trim());
    fd.append('description', values.description.trim());
    fd.append('sizes', JSON.stringify(values.sizes));
    fd.append('colors', JSON.stringify(values.colors));
    fd.append('materials', JSON.stringify(lines(values.materials)));
    fd.append('specifications', JSON.stringify(lines(values.specifications)));
    fd.append('careInstructions', JSON.stringify(lines(values.careInstructions)));
    fd.append('soldOut', String(values.soldOut));
    fd.append('isBOGO', String(values.isBOGO));
    fd.append('showOnHomepage', String(values.showOnHomepage));
    // Photos kept from before (in display order), then the new uploads.
    if (values.images.length > 0) fd.append('existing_images', JSON.stringify(values.images));
    added.forEach((p) => fd.append('image', p.file));

    setSaving(true);
    try {
      await onSubmit(fd);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    if (dirty && !window.confirm('Discard your unsaved changes?')) return;
    onCancel();
  };

  /* ----- Derived display ----- */
  const priceNum = Number(values.price) || 0;
  const mrpNum = Number(values.originalPrice) || 0;
  const save = discountPercent(priceNum, mrpNum);
  const stockNum = isWhole(values.stock) ? Number(values.stock) : null;
  const status = values.soldOut || stockNum === 0
    ? { label: 'Sold out', tone: 'danger' as const }
    : stockNum !== null && stockNum <= LOW_STOCK ? { label: 'Low stock', tone: 'warning' as const } : { label: 'Active', tone: 'success' as const };

  const saveButton = (
    <button type="submit" className="ad-btn" disabled={saving}>
      {saving && <span className="ad-spinner" />}
      {saving ? 'Saving…' : submitLabel}
    </button>
  );
  const stateText = (
    <span className="ad-products-save__state" aria-live="polite">
      {dirty ? <><i aria-hidden /> Unsaved changes</> : 'No changes yet'}
    </span>
  );

  return (
    <form onSubmit={submit} noValidate>
      <div className="ad-grid ad-grid--form">
        <div className="ad-stack">
          <Card title="Details">
            <Field label="Name" htmlFor="pf-name" error={errors.name}>
              <input id="pf-name" className="ad-input" value={values.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Indigo block-print short kurta" aria-invalid={Boolean(errors.name)} />
            </Field>
            <Field label="Description" htmlFor="pf-description" error={errors.description} hint="Fabric, fit and what makes it special. Shown on the product page.">
              <textarea id="pf-description" className="ad-textarea" rows={5} value={values.description} onChange={(e) => set('description', e.target.value)} placeholder="Hand block-printed in Jaipur on soft cotton…" aria-invalid={Boolean(errors.description)} />
            </Field>
            <Field label="Category" htmlFor="pf-category" error={errors.category}>
              <select id="pf-category" className="ad-select" value={values.category} onChange={(e) => set('category', e.target.value)} aria-invalid={Boolean(errors.category)}>
                <option value="">Choose a category</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </Card>

          <Card title="Photos" description="The first photo is the cover customers see in the shop. Hover a photo to make it the cover.">
            <div className="ad-products-photos">
              {photoCount > 0 && (
                <div className="ad-tiles">
                  {values.images.map((src, i) => (
                    <div key={`${i}:${src}`} className={`ad-tile${i === 0 ? ' is-primary' : ''}`}>
                      <img src={getImageUrl(src, 300)} alt={`Photo ${i + 1}`} loading="lazy" />
                      {i === 0 ? (
                        <span className="ad-tile__tag"><Star aria-hidden /> Cover</span>
                      ) : (
                        <button type="button" className="ad-products-tile-hit" onClick={() => coverExisting(i)}>Make cover</button>
                      )}
                      <button type="button" className="ad-tile__remove" onClick={() => removeExisting(i)} aria-label={`Remove photo ${i + 1}`}><X aria-hidden /></button>
                    </div>
                  ))}
                  {added.map((p, i) => {
                    const isCover = values.images.length === 0 && i === 0;
                    const canCover = values.images.length === 0 && i > 0;
                    return (
                      <div key={p.url} className={`ad-tile${isCover ? ' is-primary' : ''}`}>
                        <img src={p.url} alt={`New photo ${i + 1}`} />
                        {isCover && <span className="ad-tile__tag"><Star aria-hidden /> Cover</span>}
                        {canCover && <button type="button" className="ad-products-tile-hit" onClick={() => coverAdded(i)}>Make cover</button>}
                        <span className="ad-products-tile-new">New</span>
                        <button type="button" className="ad-tile__remove" onClick={() => removeAdded(i)} aria-label={`Remove new photo ${i + 1}`}><X aria-hidden /></button>
                      </div>
                    );
                  })}
                </div>
              )}
              <label
                htmlFor="pf-photos"
                className={`ad-dropzone ad-products-dropzone${dragOver ? ' is-over' : ''}${errors.photos ? ' is-invalid' : ''}`}
                onDragOver={(e) => { e.preventDefault(); if (!dragOver) setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
              >
                <ImagePlus aria-hidden />
                <strong>{photoCount ? 'Add more photos' : 'Add photos'}</strong>
                <span>Drag photos here or click to choose · JPG, PNG or WebP, up to 10 MB each</span>
                <input id="pf-photos" type="file" accept={ACCEPTED.join(',')} multiple onChange={onPick} />
              </label>
              {errors.photos && <span className="ad-error-text" role="alert">{errors.photos}</span>}
              {added.length > 0 && values.images.length > 0 && (
                <span className="ad-hint">New photos go after the current ones. You can make one the cover after saving.</span>
              )}
            </div>
          </Card>

          <Card title="Pricing">
            <div className="ad-form-grid">
              <Field label="Price" htmlFor="pf-price" error={errors.price} hint="What customers pay.">
                <div className="ad-input-group">
                  <span>₹</span>
                  <input id="pf-price" className="ad-input" type="number" inputMode="numeric" min={0} value={values.price} onChange={(e) => set('price', e.target.value)} placeholder="0" aria-invalid={Boolean(errors.price)} />
                </div>
              </Field>
              <Field label="MRP" optional htmlFor="pf-mrp" error={errors.originalPrice} hint={save > 0 ? <span style={{ color: 'var(--ad-success)' }}>Customers save {save}% ({inr(mrpNum - priceNum)})</span> : 'Shown struck through when higher than the price.'}>
                <div className="ad-input-group">
                  <span>₹</span>
                  <input id="pf-mrp" className="ad-input" type="number" inputMode="numeric" min={0} value={values.originalPrice} onChange={(e) => set('originalPrice', e.target.value)} placeholder="0" aria-invalid={Boolean(errors.originalPrice)} />
                </div>
              </Field>
            </div>
          </Card>

          <Card title="Variants" description="Type a value and press Enter. Customers pick from these on the product page.">
            <Field label="Sizes" htmlFor="pf-sizes" optional>
              <ChipInput id="pf-sizes" values={values.sizes} onChange={(v) => set('sizes', v)} placeholder="e.g. M" ideas={sizeIdeas} upper />
            </Field>
            <Field label="Colours" htmlFor="pf-colors" optional>
              <ChipInput id="pf-colors" values={values.colors} onChange={(v) => set('colors', v)} placeholder="e.g. Indigo" ideas={colourIdeas} />
            </Field>
          </Card>

          <Card title="Fabric & care" description="Optional details shown on the product page. Put one point on each line.">
            <div className="ad-form-grid">
              <Field label="Materials" optional htmlFor="pf-materials">
                <textarea id="pf-materials" className="ad-textarea" rows={3} value={values.materials} onChange={(e) => set('materials', e.target.value)} placeholder={'100% cotton\nNatural dyes'} />
              </Field>
              <Field label="Specifications" optional htmlFor="pf-specs">
                <textarea id="pf-specs" className="ad-textarea" rows={3} value={values.specifications} onChange={(e) => set('specifications', e.target.value)} placeholder={'Regular fit\nMandarin collar'} />
              </Field>
              <Field label="Care instructions" optional htmlFor="pf-care" className="ad-span-2">
                <textarea id="pf-care" className="ad-textarea" rows={3} value={values.careInstructions} onChange={(e) => set('careInstructions', e.target.value)} placeholder={'Hand wash cold\nDry in shade'} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="ad-stack ad-products-aside">
          <Card title="Status" actions={<Badge tone={status.tone}>{status.label}</Badge>}>
            <Field label="Stock quantity" htmlFor="pf-stock" error={errors.stock} hint={`Shows as low stock at ${LOW_STOCK} or fewer; sold out at 0.`}>
              <input id="pf-stock" className="ad-input" type="number" inputMode="numeric" min={0} step={1} value={values.stock} onChange={(e) => set('stock', e.target.value)} placeholder="0" aria-invalid={Boolean(errors.stock)} />
            </Field>
            <div style={{ marginTop: 10 }}>
              <Switch checked={values.soldOut} onChange={(v) => set('soldOut', v)} label="Mark as sold out" description="Stops orders even if stock is left." />
              <Switch checked={values.showOnHomepage} onChange={(v) => set('showOnHomepage', v)} label="Show on homepage" description="Feature it in the homepage collections." />
              <Switch checked={values.isBOGO} onChange={(v) => set('isBOGO', v)} label="Buy 1 Get 1" description="Include it in the buy-one-get-one offer." />
            </div>
            <div className="ad-products-save">
              {saveButton}
              <button type="button" className="ad-btn ad-btn--secondary" onClick={cancel} disabled={saving}>Cancel</button>
              {stateText}
            </div>
          </Card>
          {aside}
        </div>
      </div>

      <div className="ad-products-savebar">
        {stateText}
        <button type="button" className="ad-btn ad-btn--secondary" onClick={cancel} disabled={saving}>Cancel</button>
        {saveButton}
      </div>
    </form>
  );
};

interface ChipInputProps {
  id: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  ideas?: string[];
  upper?: boolean;
}

/** Type a value and press Enter (or comma) to add it; × or Backspace removes. */
const ChipInput = ({ id, values, onChange, placeholder, ideas = [], upper }: ChipInputProps) => {
  const [text, setText] = useState('');
  const has = (v: string) => values.some((x) => x.toLowerCase() === v.toLowerCase());

  const commit = (raw: string) => {
    const parts = raw.split(',').map((s) => s.trim()).filter(Boolean).map((s) => (upper && s.length <= 4 ? s.toUpperCase() : s));
    const next = [...values];
    parts.forEach((p) => { if (!next.some((x) => x.toLowerCase() === p.toLowerCase())) next.push(p); });
    if (next.length !== values.length) onChange(next);
    setText('');
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (text.trim()) commit(text);
    } else if (e.key === 'Backspace' && !text && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  const onType = (v: string) => {
    if (v.includes(',')) commit(v);
    else setText(v);
  };

  const suggestions = ideas.filter((i) => !has(i));

  return (
    <>
      <div className="ad-products-chipbox" onClick={() => document.getElementById(id)?.focus()}>
        {values.map((v) => (
          <span key={v} className="ad-products-chip">
            {v}
            <button type="button" onClick={(e) => { e.stopPropagation(); onChange(values.filter((x) => x !== v)); }} aria-label={`Remove ${v}`}><X aria-hidden /></button>
          </span>
        ))}
        <input
          id={id}
          value={text}
          onChange={(e) => onType(e.target.value)}
          onKeyDown={onKey}
          onBlur={() => { if (text.trim()) commit(text); }}
          placeholder={values.length ? 'Add another' : placeholder}
          enterKeyHint="done"
          autoComplete="off"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="ad-products-suggest">
          <span>Quick add:</span>
          {suggestions.map((s) => (
            <button key={s} type="button" className="ad-chip" onClick={() => onChange([...values, s])}>+ {s}</button>
          ))}
        </div>
      )}
    </>
  );
};

export default ProductForm;
