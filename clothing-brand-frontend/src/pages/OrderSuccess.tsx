import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Check, Package } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Seo from '../components/Seo';
import { API_ENDPOINTS } from '../utils/api';
import { formatPrice, shortOrderId } from '../lib/format';
import { getImageUrl } from '../utils/mediaHelper';
import { whatsappLink } from '../lib/brand';

interface OrderItem { name: string; qty: number; price: number; image: string; selectedSize?: string; selectedColor?: string }
interface Order {
  _id: string;
  orderItems: OrderItem[];
  shippingAddress: { name: string; email: string; address: string; city: string; postalCode: string; phoneNumber?: string };
  itemsPrice: number;
  discountAmount: number;
  totalPrice: number;
  isPaid: boolean;
  couponCode?: string;
}

const OrderSuccess = () => {
  const { id = '' } = useParams();
  const location = useLocation();
  const { state } = useAppContext();
  const [order, setOrder] = useState<Order | null>((location.state as { order?: Order } | null)?.order ?? null);

  useEffect(() => {
    if (order || !state.user) return;
    fetch(`${API_ENDPOINTS.ORDERS.BASE}/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((o) => o && setOrder(o))
      .catch(() => {});
  }, [id, order, state.user]);

  const number = shortOrderId(id);

  return (
    <div className="rc-container rc-section">
      <Seo title="Order confirmed" noindex />
      <div className="rc-success">
        <div className="rc-success__icon"><Check size={38} strokeWidth={2} /></div>
        <span className="rc-eyebrow">Thank you{order?.shippingAddress?.name ? `, ${order.shippingAddress.name.split(' ')[0]}` : ''}</span>
        <h1 className="rc-h1" style={{ margin: '12px 0' }}>Your order is confirmed</h1>
        <p className="rc-lead" style={{ marginInline: 'auto' }}>
          Order <strong>{number}</strong> has been placed and will be dispatched within 2–3 working days.
          Keep your order number handy — you can use it with your email{order?.shippingAddress?.email ? <> (<strong>{order.shippingAddress.email}</strong>)</> : ''} to track your order.
        </p>

        {order && (
          <div className="rc-panel" style={{ textAlign: 'left', marginTop: 32 }}>
            {order.orderItems.map((item, i) => (
              <div className="rc-line" key={i} style={{ gridTemplateColumns: '64px minmax(0,1fr) auto' }}>
                <div className="rc-thumb-qty"><span className="rc-line__img"><img src={getImageUrl(item.image, 160)} alt="" /></span><b>{item.qty}</b></div>
                <div>
                  <div className="rc-line__name">{item.name}</div>
                  <div className="rc-line__meta">{[item.selectedSize && `Size ${item.selectedSize}`, item.selectedColor].filter(Boolean).join(' · ')}</div>
                </div>
                <div>{formatPrice(item.price * item.qty)}</div>
              </div>
            ))}
            <div style={{ marginTop: 12 }}>
              <div className="rc-summary-row"><span>Subtotal</span><span>{formatPrice(order.itemsPrice)}</span></div>
              {order.discountAmount > 0 && <div className="rc-summary-row rc-summary-row--discount"><span>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</span><span>−{formatPrice(order.discountAmount)}</span></div>}
              <div className="rc-summary-row"><span>Shipping</span><span>Free</span></div>
              <div className="rc-summary-row rc-summary-row--total"><span>{order.isPaid ? 'Paid' : 'Total'}</span><span>{formatPrice(order.totalPrice)}</span></div>
            </div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--rc-line)', fontSize: 14 }}>
              <span className="rc-label">Delivering to</span>
              <p style={{ marginTop: 4 }}>{order.shippingAddress.name}<br />{order.shippingAddress.address}, {order.shippingAddress.city} – {order.shippingAddress.postalCode}</p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 32 }}>
          <Link to="/track-order" className="rc-btn"><Package size={16} /> Track your order</Link>
          <Link to="/shop" className="rc-btn rc-btn--outline">Continue shopping</Link>
        </div>
        <p className="rc-muted" style={{ fontSize: 14, marginTop: 24 }}>
          Questions about your order? <a href={whatsappLink(`Hi! I have a question about my order ${number}.`)} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a>.
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;
