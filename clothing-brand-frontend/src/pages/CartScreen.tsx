import { useEffect, useState } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, API_BASE_URL } from '../utils/api';

const CartScreen = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const qty = Number(queryParams.get('qty')) || 1;
  const size = queryParams.get('size') || '';
  const color = queryParams.get('color') || '';

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: '', email: '', address: '', city: '', postalCode: '', country: 'India', phoneNumber: ''
  });
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discountPercent: number} | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    // In a real app we'd dispatch to Redux/Context. Here we'll simulate adding.
    if (id) {
      const fetchItem = async () => {
        try {
          const res = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`);
          const data = await res.json();
          setCartItems([{...data, qty, selectedSize: size, selectedColor: color}]);
        } catch (e) {
          console.error('Error adding to cart');
        }
      };
      fetchItem();
    }
  }, [id, qty, size, color]);

  const applyCouponHandler = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMessage(null);
    try {
      const res = await fetch(`${API_ENDPOINTS.COUPONS}/validate/${couponCode}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid coupon');

      // Check max price threshold
      if (data.maxPriceThreshold !== null && data.maxPriceThreshold !== undefined) {
        const hasExpensiveItem = cartItems.some(item => item.price > data.maxPriceThreshold);
        if (hasExpensiveItem) {
          throw new Error(`Coupon is invalid! Only valid on items up to ₹${data.maxPriceThreshold}`);
        }
      }

      // Check categories
      if (data.applicableCategories && data.applicableCategories.length > 0) {
        const hasValidCategory = cartItems.some(item => data.applicableCategories.includes(item.category));
        if (!hasValidCategory) {
          throw new Error(`Coupon only valid on ${data.applicableCategories.join(' and ')}`);
        }
      }

      setAppliedCoupon(data);
      setCouponMessage({ type: 'success', text: `Coupon applied! ${data.discountPercent}% off.` });
      setCouponCode('');
    } catch (err: any) {
      setCouponMessage({ type: 'error', text: err.message });
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const calculateDiscountAmount = (items: any[], coupon: any) => {
    if (!coupon) return 0;
    let eligibleSubtotal = 0;
    for (const item of items) {
      let isEligible = true;
      if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
        if (!coupon.applicableCategories.includes(item.category)) {
          isEligible = false;
        }
      }
      if (coupon.maxPriceThreshold !== null && coupon.maxPriceThreshold !== undefined) {
        if (item.price > coupon.maxPriceThreshold) {
          isEligible = false;
        }
      }
      if (isEligible) {
        eligibleSubtotal += (item.qty * item.price);
      }
    }
    return Math.round((eligibleSubtotal * coupon.discountPercent) / 100);
  };

  const removeCouponHandler = () => {
    setAppliedCoupon(null);
    setCouponMessage(null);
  };

  const removeFromCartHandler = (removeId: any) => {
    setCartItems(cartItems.filter(x => x._id !== removeId));
    navigate('/cart');
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({...shippingAddress, [e.target.name]: e.target.value});
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentLoading(true);

    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setPaymentLoading(false);
      return;
    }

    const subtotalAmount = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
    const discountAmount = calculateDiscountAmount(cartItems, appliedCoupon);
    const totalAmount = subtotalAmount - discountAmount;

    try {
      // 1. Fetch Razorpay config
      const configRes = await fetch(`${API_BASE_URL}/api/payment/razorpay/config`);
      const { keyId } = await configRes.json();

      // 2. Create MongoDB Order
      const orderResponse = await fetch(`${API_ENDPOINTS.ORDERS.BASE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderItems: cartItems,
          shippingAddress,
          paymentMethod: 'Razorpay',
          itemsPrice: subtotalAmount, // Usually subtotal
          taxPrice: 0,
          shippingPrice: 0,
          discountAmount,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
          totalPrice: totalAmount,
        })
      });
      const orderData = await orderResponse.json();

      if (!orderResponse.ok) throw new Error('Failed to create order');

      // If total amount is 0 (100% off coupon), we can bypass Razorpay!
      if (totalAmount === 0) {
        // Call bypass route to mark as paid and trigger Shipmozo
        const bypassRes = await fetch(`${API_BASE_URL}/api/payment/bypass`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ mongo_order_id: orderData._id, user_details: { name: shippingAddress.name, email: shippingAddress.email } })
        });
        
        if (bypassRes.ok) {
          alert('Order Placed Successfully! (100% Discount Applied). Your AWB has been generated.');
          setCartItems([]);
          navigate('/profile');
        } else {
          alert('Failed to process 100% off order');
        }
        setPaymentLoading(false);
        return;
      }

      // 3. Create Razorpay Order
      const rzpResponse = await fetch(`${API_BASE_URL}/api/payment/razorpay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount, receipt: orderData._id })
      });
      const rzpData = await rzpResponse.json();

      if (!rzpResponse.ok) throw new Error('Failed to init payment');

      // 4. Open Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "Rang and Craft",
        description: "Premium Ethnic Wear",
        order_id: rzpData.id,
        handler: async function (response: any) {
          // 5. Verify payment & Trigger Shipmozo
          const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              mongo_order_id: orderData._id,
              user_details: { name: shippingAddress.name, email: shippingAddress.email }
            })
          });
          
          if (verifyRes.ok) {
            alert('Payment Successful! Order Confirmed. Your AWB has been generated.');
            setCartItems([]);
            navigate('/profile');
          } else {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          contact: shippingAddress.phoneNumber
        },
        theme: {
          color: "#4B0082"
        }
      };
      
      // Mock flow handler if using dummy keys
      if (rzpData.id.startsWith('order_mock_')) {
        options.handler({
          razorpay_payment_id: 'mock_payment_' + Date.now(),
          razorpay_order_id: rzpData.id,
          razorpay_signature: 'mock_signature_skip'
        });
        return;
      }

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error(err);
      alert('Error initiating checkout. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="container page-top-padding cart-screen-container">
      <h1 className="font-serif text-center" style={{fontSize: '2.5rem', marginBottom: '30px', color: 'var(--primary-purple)'}}>Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center" style={{padding: '50px 0', border: '1px solid #e6f0f0', background: '#fdfaff', borderRadius: '4px'}}>
          <h2 className="font-serif mb-4" style={{marginBottom: '20px'}}>Your cart is empty</h2>
          <Link to="/shop" className="btn btn-primary">Go Back To Shop</Link>
        </div>
      ) : (
        <div className="cart-grid-wrap">
          {!isCheckingOut ? (
            <>
              <div className="cart-items-list-wrap">
                {cartItems.map((item) => (
                  <div key={item._id} className="cart-item-card">
                    <div className="cart-item-img">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="cart-item-info">
                      <Link to={`/product/${item._id}`} className="font-serif item-name-link">
                        {item.name}
                      </Link>
                      <div className="item-meta">
                        <span className="item-price">₹{item.price.toLocaleString('en-IN')}</span>
                        <span className="item-qty">Qty: {item.qty}</span>
                      </div>
                      {(item.selectedSize || item.selectedColor) && (
                        <div style={{ marginTop: '8px', fontSize: '0.85rem', color: '#666', display: 'flex', gap: '15px' }}>
                          {item.selectedSize && <span>Size: <strong style={{ color: '#295454' }}>{item.selectedSize}</strong></span>}
                          {item.selectedColor && <span>Color: <strong style={{ color: '#295454' }}>{item.selectedColor}</strong></span>}
                        </div>
                      )}
                    </div>
                    <div className="cart-item-actions">
                      <button onClick={() => removeFromCartHandler(item._id)} className="btn-remove">
                        REMOVE
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary-card">
                <h2 className="font-serif summary-title">Cart Summary</h2>
                
                {/* Coupon Code Section */}
                <div style={{ marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem', color: '#295454', display: 'block', marginBottom: '10px' }}>Apply Coupon Code</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code" 
                      className="form-input"
                      style={{ padding: '8px 12px', flex: 1, textTransform: 'uppercase' }}
                      disabled={!!appliedCoupon}
                    />
                    {!appliedCoupon ? (
                      <button 
                        onClick={applyCouponHandler} 
                        disabled={couponLoading || !couponCode.trim()}
                        style={{ backgroundColor: '#295454', color: 'white', border: 'none', borderRadius: '4px', padding: '0 15px', fontWeight: 'bold', cursor: 'pointer', opacity: (couponLoading || !couponCode.trim()) ? 0.7 : 1 }}
                      >
                        {couponLoading ? '...' : 'APPLY'}
                      </button>
                    ) : (
                      <button 
                        onClick={removeCouponHandler}
                        style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', padding: '0 15px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        REMOVE
                      </button>
                    )}
                  </div>
                  {couponMessage && (
                    <p style={{ marginTop: '8px', fontSize: '0.8rem', color: couponMessage.type === 'success' ? '#16a34a' : '#ef4444' }}>
                      {couponMessage.text}
                    </p>
                  )}
                </div>

                <div className="summary-row">
                  <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                  <span>₹{cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toLocaleString('en-IN')}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="summary-row" style={{ color: '#16a34a' }}>
                    <span>Discount ({appliedCoupon.discountPercent}%)</span>
                    <span>-₹{calculateDiscountAmount(cartItems, appliedCoupon).toLocaleString('en-IN')}</span>
                  </div>
                )}
                
                <div className="summary-row" style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '10px' }}>
                  <span style={{ fontWeight: '800' }}>Total</span>
                  <span className="summary-total">₹{(
                    cartItems.reduce((acc, item) => acc + item.qty * item.price, 0) - 
                    calculateDiscountAmount(cartItems, appliedCoupon)
                  ).toLocaleString('en-IN')}</span>
                </div>
                
                <button 
                  type="button" 
                  className="btn btn-primary w-full"
                  onClick={() => setIsCheckingOut(true)}
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </>
          ) : (
            <div className="checkout-form-wrap" style={{width: '100%', maxWidth: '600px', margin: '0 auto'}}>
              <h2 className="font-serif summary-title">Shipping Details</h2>
              <form onSubmit={processPayment} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                <input type="text" name="name" placeholder="Full Name" value={shippingAddress.name} onChange={handleInputChange} required className="form-input" />
                <input type="email" name="email" placeholder="Email Address" value={shippingAddress.email} onChange={handleInputChange} required className="form-input" />
                <input type="text" name="phoneNumber" placeholder="Phone Number" value={shippingAddress.phoneNumber} onChange={handleInputChange} required className="form-input" />
                <input type="text" name="address" placeholder="Complete Address" value={shippingAddress.address} onChange={handleInputChange} required className="form-input" />
                <div style={{display: 'flex', gap: '15px'}}>
                  <input type="text" name="city" placeholder="City" value={shippingAddress.city} onChange={handleInputChange} required className="form-input" style={{flex: 1}} />
                  <input type="text" name="postalCode" placeholder="Pincode" value={shippingAddress.postalCode} onChange={handleInputChange} required className="form-input" style={{flex: 1}} />
                </div>
                
                <div className="summary-row" style={{marginTop: '20px', padding: '15px 0', borderTop: '1px solid #eee'}}>
                  <span>Total Amount to Pay</span>
                  <span className="summary-total">₹{(
                    cartItems.reduce((acc, item) => acc + item.qty * item.price, 0) - 
                    calculateDiscountAmount(cartItems, appliedCoupon)
                  ).toLocaleString('en-IN')}</span>
                </div>

                <div style={{display: 'flex', gap: '15px', marginTop: '10px'}}>
                  <button type="button" className="btn btn-outline" onClick={() => setIsCheckingOut(false)} style={{flex: 1}}>BACK TO CART</button>
                  <button type="submit" className="btn btn-primary" disabled={paymentLoading} style={{flex: 2}}>
                    {paymentLoading ? 'PROCESSING...' : 'PAY NOW (RAZORPAY)'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      <style>{`
        .cart-screen-container {
          padding: 50px 20px !important;
        }
        .cart-grid-wrap {
          display: flex;
          gap: 30px;
          flex-wrap: wrap;
        }
        .cart-items-list-wrap {
          flex: 2;
          min-width: 280px;
        }
        .cart-item-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }
        .cart-item-img {
          width: 80px;
          flex-shrink: 0;
        }
        .cart-item-img img {
          width: 100%;
          border-radius: 4px;
        }
        .cart-item-info {
          flex: 1;
        }
        .item-name-link {
          font-size: 1.1rem;
          color: #333;
          text-decoration: none;
          display: block;
          margin-bottom: 5px;
        }
        .item-meta {
          display: flex;
          gap: 15px;
          font-size: 0.9rem;
          color: #666;
        }
        .item-price {
          font-weight: 700;
          color: var(--accent-purple);
        }
        .cart-item-actions {
          margin-left: auto;
        }
        .btn-remove {
          background: none;
          border: 1px solid #ddd;
          padding: 5px 12px;
          font-size: 0.65rem;
          font-weight: 800;
          cursor: pointer;
          border-radius: 4px;
          color: #999;
          transition: all 0.3s;
        }
        .btn-remove:hover {
          color: #e53e3e;
          border-color: #e53e3e;
        }
        .cart-summary-card {
          flex: 1;
          min-width: 280px;
          padding: 30px;
          background: #fcfcfc;
          border: 1px solid #eee;
          border-radius: 8px;
          align-self: flex-start;
        }
        .summary-title {
          font-size: 1.5rem;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
          font-weight: 600;
        }
        .summary-total {
          font-size: 1.2rem;
          color: var(--primary-purple);
        }
        .form-input {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          font-family: 'Inter', sans-serif;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--primary-purple);
          box-shadow: 0 0 0 2px rgba(75,0,130,0.1);
        }
        .btn-outline {
          background: transparent;
          border: 1px solid var(--primary-purple);
          color: var(--primary-purple);
        }
        .btn-outline:hover {
          background: var(--primary-purple);
          color: white;
        }

        @media (max-width: 768px) {
          .cart-screen-container h1 {
            font-size: 1.8rem !important;
          }
          .cart-item-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          .cart-item-img {
            width: 100px;
          }
          .cart-item-actions {
            margin-left: 0;
            width: 100%;
          }
          .btn-remove {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default CartScreen;

