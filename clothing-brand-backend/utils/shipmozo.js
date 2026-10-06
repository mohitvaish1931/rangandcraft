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


    // Without a token, return mock data in development only. In production a
    // fake AWB would be shown to customers as real tracking information.
    if (!process.env.SHIPMOZO_API_TOKEN) {
      if (process.env.NODE_ENV === 'production') {
        console.warn('SHIPMOZO_API_TOKEN not set; shipment must be booked manually for order', String(order._id));
        return null;
      }
      console.log('SHIPMOZO_API_TOKEN not found, returning mock shipping data');
      return {
        awbNumber: 'MOCK_AWB_' + Date.now(),
        courierName: 'BlueDart (Mock)',
        trackingUrl: 'https://shipmozo.com/track/mock',
        labelPdf: 'https://shipmozo.com/label/mock.pdf'
      };
    }

    const response = await axios.post(`${SHIPMOZO_BASE_URL}/orders`, payload, {
      headers: {
        'Authorization': `Bearer ${process.env.SHIPMOZO_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      awbNumber: response.data.awb_number || 'N/A',
      courierName: response.data.courier_name || 'N/A',
      trackingUrl: response.data.tracking_url || '',
      labelPdf: response.data.label_pdf || ''
    };
  } catch (error) {
    console.error('Shipmozo Order Creation Failed:', error.response?.data || error.message);
    // Don't throw, just return null so payment verify still succeeds even if shipping API fails
    return null;
  }
};
