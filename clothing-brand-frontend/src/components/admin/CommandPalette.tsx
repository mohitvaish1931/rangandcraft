import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, type LucideIcon } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { API_ENDPOINTS, fetchJSON } from '../../utils/api';
import type { AdminOrder } from '../../lib/adminTypes';
import { getImageUrl } from '../../utils/mediaHelper';
import { productId, shortOrderId } from '../../lib/format';
import { inr, orderStatus, orderTotal } from '../../lib/adminFormat';

export interface PaletteLink { to: string; label: string; icon: LucideIcon; group: string }

interface Item { key: string; group: string; label: string; hint?: string; to: string; icon?: LucideIcon; image?: string }

/** ⌘K quick search across admin pages, products and orders. */
const CommandPalette = ({ links, onClose }: { links: PaletteLink[]; onClose: () => void }) => {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    fetchJSON<AdminOrder[]>(API_ENDPOINTS.ORDERS.BASE).then(setOrders).catch(() => {});
  }, []);

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase().replace(/^#/, '');
    const match = (...fields: (string | undefined)[]) => !q || fields.some((f) => (f || '').toLowerCase().includes(q));
    const pages = links.filter((l) => match(l.label, l.group)).map((l) => ({ key: `p-${l.to}`, group: 'Go to', label: l.label, hint: l.group, to: l.to, icon: l.icon }));
    if (!q) return pages;
    const products = state.products
      .filter((p) => match(p.name, p.category))
      .slice(0, 6)
      .map((p) => ({ key: `pr-${productId(p)}`, group: 'Products', label: p.name, hint: inr(p.price), to: `/admin/products/${productId(p)}/edit`, image: getImageUrl(p.image, 80) }));
    const found = orders
      .filter((o) => match(String(o._id).slice(-8), o.shippingAddress?.name, o.shippingAddress?.email, o.shippingAddress?.phoneNumber))
      .slice(0, 6)
      .map((o) => ({ key: `o-${o._id}`, group: 'Orders', label: `${shortOrderId(o._id)} · ${o.shippingAddress?.name || 'Guest'}`, hint: `${inr(orderTotal(o))} · ${orderStatus(o).label}`, to: `/admin/orders?open=${o._id}`, icon: Package }));
    return [...pages, ...products, ...found];
  }, [query, links, state.products, orders]);

  const current = Math.min(active, Math.max(items.length - 1, 0));
  const go = (item?: Item) => { if (!item) return; onClose(); navigate(item.to); };

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [current]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((current + 1) % Math.max(items.length, 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((current - 1 + items.length) % Math.max(items.length, 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(items[current]); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  return (
    <>
      <div className="ad-overlay" onClick={onClose} aria-hidden />
      <div className="ad-palette" role="dialog" aria-modal="true" aria-label="Search the admin" onKeyDown={onKey}>
        <div className="ad-palette__input">
          <Search aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            placeholder="Search pages, products, orders…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="ad-palette-list"
          />
        </div>
        <div className="ad-palette__list" id="ad-palette-list" role="listbox" ref={listRef}>
          {items.length === 0 && <div className="ad-palette__empty">Nothing matches “{query}”.</div>}
          {items.map((item, i) => {
            const header = i === 0 || items[i - 1].group !== item.group ? <div className="ad-palette__group">{item.group}</div> : null;
            const Icon = item.icon;
            return (
              <div key={item.key}>
                {header}
                <button type="button" role="option" aria-selected={i === current} className="ad-palette__item" onMouseEnter={() => setActive(i)} onClick={() => go(item)}>
                  {item.image ? <img src={item.image} alt="" /> : Icon && <Icon aria-hidden />}
                  <strong>{item.label}</strong>
                  {item.hint && <span>{item.hint}</span>}
                </button>
              </div>
            );
          })}
        </div>
        <div className="ad-palette__foot">
          <span><kbd>↑</kbd> <kbd>↓</kbd> to move</span>
          <span><kbd>Enter</kbd> to open</span>
          <span><kbd>Esc</kbd> to close</span>
        </div>
      </div>
    </>
  );
};

export default CommandPalette;
