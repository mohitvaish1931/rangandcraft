import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, Images, Pencil, Star } from 'lucide-react';
import { useAppContext, type Product } from '../../context/AppContext';
import { API_ENDPOINTS, fetchJSON } from '../../utils/api';
import { errorMessage, productId } from '../../lib/format';
import { useToast } from '../../lib/toast';
import { getImageUrl } from '../../utils/mediaHelper';
import { Card, EmptyState, PageHeader, SearchBox, Tabs } from '../../components/admin/ui';
import '../../styles/admin-products.css';

type FilterKey = 'several' | 'single';

const photosOf = (p: Product) => (p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : []);

const AdminFirstPhotoSection = () => {
  const { state, dispatch } = useAppContext();
  const toast = useToast();
  const [filter, setFilter] = useState<FilterKey>('several');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState<{ id: string; index: number } | null>(null);

  const products = state.products;
  const loading = state.productsStatus === 'idle' || state.productsStatus === 'loading';

  const groups = useMemo(() => ({
    several: products.filter((p) => photosOf(p).length > 1),
    single: products.filter((p) => photosOf(p).length <= 1),
  }), [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups[filter].filter((p) => !q || [p.name, p.category].some((v) => String(v || '').toLowerCase().includes(q)));
  }, [groups, filter, query]);

  const makeCover = async (p: Product, index: number) => {
    if (index === 0 || busy) return;
    const id = productId(p);
    const images = [...photosOf(p)];
    const [picked] = images.splice(index, 1);
    images.unshift(picked);

    const fd = new FormData();
    fd.append('existing_images', JSON.stringify(images));
    setBusy({ id, index });
    try {
      const updated = await fetchJSON<Product>(`${API_ENDPOINTS.PRODUCTS}/${id}`, { method: 'PUT', body: fd });
      dispatch({ type: 'UPDATE_PRODUCT', payload: updated });
      toast.success(`Cover photo updated for ${p.name}`);
    } catch (err) {
      toast.error(errorMessage(err, 'Couldn’t update the cover photo. Please try again.'));
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Product photos"
        description="Choose the cover photo customers see first in the shop. Click any photo to make it the cover."
      />

      <div className="ad-toolbar">
        <Tabs
          label="Filter products"
          value={filter}
          onChange={setFilter}
          items={[
            { key: 'several', label: 'Several photos', count: groups.several.length },
            { key: 'single', label: 'One photo or none', count: groups.single.length },
          ]}
        />
        <div className="ad-toolbar__grow" />
        <SearchBox value={query} onChange={setQuery} placeholder="Search products" label="Search products" />
      </div>

      {loading ? (
        <div className="ad-grid ad-grid--2 ad-products-grid" aria-busy="true" aria-label="Loading">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="ad-card" style={{ padding: 20, display: 'grid', gap: 14 }}>
              <span className="ad-skel" style={{ height: 14, width: '45%' }} />
              <div className="ad-tiles">
                {[0, 1, 2].map((t) => <span key={t} className="ad-skel" style={{ aspectRatio: '4 / 5', borderRadius: 12 }} />)}
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={Images}
            title={query ? 'No matching products' : filter === 'several' ? 'No products with several photos yet' : 'Every product has several photos'}
            text={query ? 'Try a different name or category.' : filter === 'several' ? 'Add more photos to a product, then come back here to pick its cover.' : 'Nice. Customers can see each piece from more than one angle.'}
            action={!query && filter === 'several' ? <Link to="/admin/products" className="ad-btn">Go to products</Link> : undefined}
          />
        </Card>
      ) : (
        <div className="ad-grid ad-grid--2 ad-products-grid">
          {visible.map((p) => {
            const id = productId(p);
            const photos = photosOf(p);
            const saving = busy?.id === id;
            return (
              <Card
                key={id}
                title={p.name}
                description={`${p.category ? `${p.category} · ` : ''}${photos.length} photo${photos.length === 1 ? '' : 's'}`}
                actions={(
                  <Link to={`/admin/products/${id}/edit`} className="ad-btn ad-btn--secondary ad-btn--sm">
                    {photos.length > 1 ? <><Pencil aria-hidden /> Edit</> : <><ImagePlus aria-hidden /> Add photos</>}
                  </Link>
                )}
              >
                {photos.length === 0 ? (
                  <p className="ad-hint">No photos yet.</p>
                ) : (
                  <div className="ad-tiles">
                    {photos.map((src, i) => {
                      const cover = i === 0;
                      return (
                        <button
                          key={`${i}:${src}`}
                          type="button"
                          className={`ad-tile ad-products-pick${cover ? ' is-primary' : ''}`}
                          onClick={() => makeCover(p, i)}
                          disabled={Boolean(busy) && !cover}
                          aria-pressed={cover}
                          aria-label={cover ? `Photo ${i + 1}, current cover` : `Make photo ${i + 1} the cover`}
                        >
                          <img src={getImageUrl(src, 300)} alt="" loading="lazy" />
                          {cover ? (
                            <span className="ad-tile__tag"><Star aria-hidden /> Cover</span>
                          ) : (
                            <span className="ad-products-tile-hit" aria-hidden>Make cover</span>
                          )}
                          {saving && busy?.index === i && <span className="ad-products-busy"><span className="ad-spinner" /></span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
};

export default AdminFirstPhotoSection;
