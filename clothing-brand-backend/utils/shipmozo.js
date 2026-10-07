import axios from 'axios';

// Note: Replace with actual Shipmozo base URL when known
const SHIPMOZO_BASE_URL = 'https://api.shipmozo.com/v1';

export const createShipmozoOrder = async (order, user) => {
  try {
    const payload = {
      customer_name: user ? user.name : 'Guest',
      address: order.shippingAddress.address,
      city: order.shippingAddress.city,
      pincode: order.shippingAddress.postalCode,
      mobile: order.shippingAddress.phoneNumber || '0000000000',
      product_name: order.orderItems.map(item => item.name).join(', '),
      weight: 0.5 * order.orderItems.length, // assumption
      dimensions: '10x10x10', // assumption
      payment_type: 'Prepaid', // since Razorpay successful
      invoice_amount: order.totalPrice
    };


    // Without a token the shipment is booked by hand from the admin panel.
    // SHIPMOZO_MOCK=true returns fake data for local demos only; it must never
    // be on in production, where a fake AWB would be shown to customers.
    if (!process.env.SHIPMOZO_API_TOKEN) {
      if (process.env.SHIPMOZO_MOCK === 'true' && process.env.NODE_ENV !== 'production') {
        return {
          awbNumber: 'MOCK_AWB_' + Date.now(),
          courierName: 'BlueDart (Mock)',
          trackingUrl: 'https://shipmozo.com/track/mock',
          labelPdf: 'https://shipmozo.com/label/mock.pdf'
        };
      }
      return null;
    }

    const response = await axios.post(`${SHIPMOZO_BASE_URL}/orders`, payload, {
      headers: {
        'Authorization': `Bearer ${process.env.SHIPMOZO_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      awbNumber: response.data.awb_number || undefined,
      courierName: response.data.courier_name || undefined,
      trackingUrl: response.data.tracking_url || undefined,
      labelPdf: response.data.label_pdf || undefined
    };
  } catch (error) {
    console.error('Shipmozo Order Creation Failed:', error.response?.data || error.message);
    // Don't throw, just return null so payment verify still succeeds even if shipping API fails
    return null;
  }
};
