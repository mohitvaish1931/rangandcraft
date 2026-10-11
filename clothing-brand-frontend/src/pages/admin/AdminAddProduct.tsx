import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { API_ENDPOINTS } from '../../utils/api';
import { useToast } from '../../lib/toast';
import { PageHeader } from '../../components/admin/ui';
import ProductForm from '../../components/admin/ProductForm';

const AdminAddProduct = () => {
  const { dispatch } = useAppContext();
  const navigate = useNavigate();
  const toast = useToast();
  const { refreshSummary } = useOutletContext<{ refreshSummary?: () => void }>() ?? {};

  const create = async (fd: FormData) => {
    const res = await fetch(API_ENDPOINTS.PRODUCTS, { method: 'POST', body: fd, credentials: 'include' });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload?.error || payload?.message || 'Couldn’t add the product. Please try again.');
    }
    const created = await res.json();
    dispatch({ type: 'ADD_PRODUCT', payload: created });
    refreshSummary?.();
    toast.success(`“${created?.name ?? 'Product'}” added to the shop`);
    navigate('/admin/products');
  };

  return (
    <>
      <PageHeader
        back={{ to: '/admin/products', label: 'Products' }}
        title="Add product"
        description="Fill in the details below. You can change anything later."
      />
      <ProductForm submitLabel="Add product" onSubmit={create} onCancel={() => navigate('/admin/products')} />
    </>
  );
};

export default AdminAddProduct;
