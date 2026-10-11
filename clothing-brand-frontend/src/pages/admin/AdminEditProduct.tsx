import { useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { ExternalLink, PackageX, RefreshCw, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { API_ENDPOINTS } from '../../utils/api';
import { errorMessage, formatDate } from '../../lib/format';
import { useToast } from '../../lib/toast';
import { Card, EmptyState, PageHeader } from '../../components/admin/ui';
import ProductForm from '../../components/admin/ProductForm';

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { state, dispatch } = useAppContext();
  const { refreshSummary } = useOutletContext<{ refreshSummary?: () => void }>() ?? {};
  const [deleting, setDeleting] = useState(false);

  const product = state.products.find((p) => (p._id || String(p.id)) === id);
  const loading = state.productsStatus === 'idle' || state.productsStatus === 'loading';

  if (!product) {
    return (
      <>
        <PageHeader back={{ to: '/admin/products', label: 'Products' }} title={loading ? 'Loading product…' : 'Edit product'} />
        {loading ? <FormSkeleton /> : state.productsStatus === 'error' ? (
          <Card>
            <EmptyState
              icon={RefreshCw}
              title="Couldn’t load your products"
              text="Check your connection and try again."
              action={<button type="button" className="ad-btn" onClick={() => window.location.reload()}><RefreshCw aria-hidden /> Try again</button>}
            />
          </Card>
        ) : (
          <Card>
            <EmptyState
              icon={PackageX}
              title="Product not found"
              text="It may have been deleted, or the link is wrong."
              action={<Link to="/admin/products" className="ad-btn">Back to products</Link>}
            />
          </Card>
        )}
      </>
    );
  }

  const update = async (fd: FormData) => {
    const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, { method: 'PUT', body: fd });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload?.error || payload?.message || 'Couldn’t save the product. Please try again.');
    }
    const updated = await res.json();
    dispatch({ type: 'UPDATE_PRODUCT', payload: updated });
    refreshSummary?.();
    toast.success('Product saved');
    navigate('/admin/products');
  };

  const remove = async () => {
    if (!window.confirm(`Delete “${product.name}”? This removes it from the shop and can’t be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || 'Couldn’t delete the product.');
      }
      dispatch({ type: 'REMOVE_PRODUCT', payload: id! });
      refreshSummary?.();
      toast.success('Product deleted');
      navigate('/admin/products');
    } catch (err) {
      toast.error(errorMessage(err));
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        back={{ to: '/admin/products', label: 'Products' }}
        title={product.name}
        description={[product.category, product.createdAt ? `Added ${formatDate(product.createdAt)}` : ''].filter(Boolean).join(' · ')}
        actions={(
          <a href={`/product/${id}`} target="_blank" rel="noreferrer" className="ad-btn ad-btn--secondary">
            <ExternalLink aria-hidden /> View on store
          </a>
        )}
      />
      <ProductForm
        key={id}
        submitLabel="Save changes"
        onSubmit={update}
        onCancel={() => navigate('/admin/products')}
        initial={{
          name: product.name || '',
          description: product.description || '',
          category: product.category || '',
          price: product.price != null ? String(product.price) : '',
          originalPrice: product.originalPrice ? String(product.originalPrice) : '',
          stock: String(product.countInStock ?? product.stock ?? 0),
          sizes: [...(product.sizes || [])],
          colors: [...(product.colors || [])],
          materials: product.materials?.join('\n') || '',
          specifications: product.specifications?.join('\n') || '',
          careInstructions: product.careInstructions?.join('\n') || '',
          soldOut: Boolean(product.soldOut),
          isBOGO: Boolean(product.isBOGO),
          showOnHomepage: product.showOnHomepage !== false,
          images: product.images?.length ? [...product.images] : product.image && !product.image.includes('placeholder') ? [product.image] : [],
        }}
        aside={(
          <Card title="Delete product" description="Removes it from the shop for good. Past orders keep their details.">
            <button type="button" className="ad-btn ad-btn--danger ad-btn--block" onClick={remove} disabled={deleting}>
              {deleting ? <span className="ad-spinner" /> : <Trash2 aria-hidden />} Delete product
            </button>
          </Card>
        )}
      />
    </>
  );
};

const FormSkeleton = () => (
  <div className="ad-grid ad-grid--form" aria-busy="true" aria-label="Loading">
    <div className="ad-stack">
      {[180, 260, 120].map((h, i) => (
        <div key={i} className="ad-card" style={{ padding: 20, display: 'grid', gap: 12 }}>
          <span className="ad-skel" style={{ height: 14, width: 120 }} />
          <span className="ad-skel" style={{ height: h - 60 }} />
        </div>
      ))}
    </div>
    <div className="ad-stack">
      <div className="ad-card" style={{ padding: 20, display: 'grid', gap: 12 }}>
        <span className="ad-skel" style={{ height: 14, width: 80 }} />
        <span className="ad-skel" style={{ height: 40 }} />
        <span className="ad-skel" style={{ height: 120 }} />
      </div>
    </div>
  </div>
);

export default AdminEditProduct;
