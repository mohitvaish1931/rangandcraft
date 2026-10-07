// Integration tests. Requires a MongoDB instance:
//   MONGO_TEST_URI=mongodb://localhost:27017/rangandcraft_test npm test
import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import mongoose from 'mongoose';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
delete process.env.RAZORPAY_KEY_ID;
delete process.env.RAZORPAY_KEY_SECRET;
delete process.env.SHIPMOZO_API_TOKEN;

const { app } = await import('../server.js');
const { default: User } = await import('../models/User.js');
const { default: Product } = await import('../models/Product.js');
const { default: Coupon } = await import('../models/Coupon.js');
const { default: Order } = await import('../models/Order.js');
const { setMailTransport } = await import('../utils/mailer.js');

const MONGO = process.env.MONGO_TEST_URI || 'mongodb://127.0.0.1:27017/rangandcraft_test';

let adminToken;
let userToken;
let product;
let cheapProduct;

const address = {
  name: 'Test Buyer',
  email: 'buyer@example.com',
  phoneNumber: '9876543210',
  address: '12 MI Road',
  city: 'Jaipur',
  postalCode: '302001',
  country: 'India',
};

before(async () => {
  await mongoose.connect(MONGO);
  await mongoose.connection.db.dropDatabase();

  const adminUser = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'secret123', isAdmin: true });
  await User.create({ name: 'Shopper', email: 'Shopper@Example.com', password: 'secret123' });

  product = await Product.create({
    user: adminUser._id, name: 'Indigo Short Kurta', image: 'https://example.com/a.jpg', brand: 'RC',
    category: 'Short Kurtas', description: 'Hand block printed', price: 999, originalPrice: 1499,
    countInStock: 5, sizes: ['M', 'L'],
  });
  cheapProduct = await Product.create({
    user: adminUser._id, name: 'Linen Shirt', image: 'https://example.com/b.jpg', brand: 'RC',
    category: 'Shirts', description: 'Linen', price: 500, countInStock: 3,
  });
  await Coupon.create({ code: 'KURTA10', discountPercent: 10, applicableCategories: ['Short Kurtas'] });
  await Coupon.create({ code: 'FREE', discountPercent: 100 });
  await Coupon.create({ code: 'OLD', discountPercent: 50, expiresAt: new Date(Date.now() - 1000) });
});

after(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe('auth', () => {
  test('login returns a token and never the password', async () => {
    const res = await request(app).post('/api/users/login').send({ email: 'admin@example.com', password: 'secret123' });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.password, undefined);
    adminToken = res.body.token;
  });

  test('login is case-insensitive for legacy mixed-case emails', async () => {
    const res = await request(app).post('/api/users/login').send({ email: 'shopper@example.com', password: 'secret123' });
    assert.equal(res.status, 200);
    userToken = res.body.token;
  });

  test('login rejects operator injection', async () => {
    const res = await request(app).post('/api/users/login').send({ email: { $ne: null }, password: { $ne: null } });
    assert.ok([400, 401].includes(res.status));
    assert.equal(res.body.token, undefined);
  });

  test('register ignores isAdmin and validates input', async () => {
    const bad = await request(app).post('/api/users').send({ name: 'X', email: 'x@example.com', password: '123' });
    assert.equal(bad.status, 400);
    const res = await request(app).post('/api/users').send({ name: 'Eve', email: 'eve@example.com', password: 'secret123', isAdmin: true });
    assert.equal(res.status, 201);
    assert.equal(res.body.isAdmin, false);
  });

  test('profile update does not corrupt the password hash', async () => {
    const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${userToken}`).send({ name: 'Shopper Two' });
    assert.equal(res.status, 200);
    const login = await request(app).post('/api/users/login').send({ email: 'shopper@example.com', password: 'secret123' });
    assert.equal(login.status, 200);
  });
});

describe('admin routes are protected', () => {
  const adminOnly = [
    ['get', '/api/users'],
    ['get', '/api/orders'],
    ['get', '/api/coupons'],
    ['post', '/api/coupons'],
    ['post', '/api/banners'],
    ['post', '/api/products'],
    ['delete', '/api/products/000000000000000000000000'],
    ['post', '/api/products/reorder'],
    ['get', '/api/reviews/admin/pending'],
  ];

  for (const [method, path] of adminOnly) {
    test(`${method.toUpperCase()} ${path} needs a token`, async () => {
      const res = await request(app)[method](path).send({});
      assert.equal(res.status, 401);
    });
    test(`${method.toUpperCase()} ${path} rejects non-admins`, async () => {
      const res = await request(app)[method](path).set('Authorization', `Bearer ${userToken}`).send({});
      assert.equal(res.status, 403);
    });
  }

  test('forged token is rejected', async () => {
    const res = await request(app).get('/api/users').set('Authorization', 'Bearer not.a.token');
    assert.equal(res.status, 401);
  });

  test('admin can list users', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.every((u) => u.password === undefined));
  });
});

describe('products', () => {
  test('keyword search treats regex characters literally', async () => {
    const res = await request(app).get('/api/products').query({ keyword: '(a+)+$' });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, []);
  });

  test('invalid id gives 404, not 500', async () => {
    const res = await request(app).get('/api/products/not-an-id');
    assert.equal(res.status, 404);
  });
});

describe('orders and payments', () => {
  test('order total is computed on the server, ignoring client prices', async () => {
    const res = await request(app).post('/api/orders').send({
      orderItems: [{ _id: product._id, qty: 2, price: 1, selectedSize: 'M' }],
      shippingAddress: address,
      totalPrice: 1,
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.itemsPrice, 1998);
    // Two short kurtas trigger the "any 2 @ ₹1499" bundle; 1499 qualifies for free shipping.
    assert.equal(res.body.offerDiscount, 499);
    assert.equal(res.body.shippingPrice, 0);
    assert.equal(res.body.totalPrice, 1499);
  });

  test('orders below ₹1499 pay ₹70 shipping', async () => {
    const res = await request(app).post('/api/orders/quote').send({ orderItems: [{ _id: cheapProduct._id, qty: 2 }] });
    assert.equal(res.body.itemsPrice, 1000);
    assert.equal(res.body.shippingPrice, 70);
    assert.equal(res.body.totalPrice, 1070);
  });

  test('size is required when the product has sizes', async () => {
    const res = await request(app).post('/api/orders').send({
      orderItems: [{ _id: product._id, qty: 1 }],
      shippingAddress: address,
    });
    assert.equal(res.status, 400);
  });

  test('cannot order more than is in stock', async () => {
    const res = await request(app).post('/api/orders').send({
      orderItems: [{ _id: cheapProduct._id, qty: 4 }],
      shippingAddress: address,
    });
    assert.equal(res.status, 409);
  });

  test('coupons apply only to eligible categories', async () => {
    const res = await request(app).post('/api/orders/quote').send({
      orderItems: [{ _id: product._id, qty: 1, selectedSize: 'L' }, { _id: cheapProduct._id, qty: 1 }],
      couponCode: 'kurta10',
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.itemsPrice, 1499);
    assert.equal(res.body.discountAmount, 100);
    assert.equal(res.body.totalPrice, 1399);
  });

  test('expired coupons are rejected', async () => {
    const res = await request(app).post('/api/orders').send({
      orderItems: [{ _id: cheapProduct._id, qty: 1 }],
      shippingAddress: address,
      couponCode: 'OLD',
    });
    assert.equal(res.status, 400);
  });

  test('verify rejects a payment id that was not issued for the order', async () => {
    const order = await request(app).post('/api/orders').send({
      orderItems: [{ _id: cheapProduct._id, qty: 1 }],
      shippingAddress: address,
    });
    const res = await request(app).post('/api/payment/verify').send({
      mongo_order_id: order.body._id,
      razorpay_order_id: 'order_mock_attacker',
      razorpay_payment_id: 'x',
      razorpay_signature: 'x',
    });
    assert.equal(res.status, 400);
    const stored = await Order.findById(order.body._id);
    assert.equal(stored.isPaid, false);
  });

  test('with Razorpay keys set, the mock prefix no longer skips signature checks', async () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    process.env.RAZORPAY_KEY_SECRET = 'rzp_secret';
    try {
      const order = await Order.create({
        orderItems: [{ name: 'x', qty: 1, image: 'x', price: 500, product: cheapProduct._id }],
        shippingAddress: address, paymentMethod: 'Razorpay', totalPrice: 500, itemsPrice: 500,
        razorpayOrderId: 'order_mock_forged',
      });
      const forged = await request(app).post('/api/payment/verify').send({
        mongo_order_id: order._id, razorpay_order_id: 'order_mock_forged', razorpay_payment_id: 'pay_1', razorpay_signature: 'bad',
      });
      assert.equal(forged.status, 400);

      const signature = crypto.createHmac('sha256', 'rzp_secret').update('order_mock_forged|pay_1').digest('hex');
      const genuine = await request(app).post('/api/payment/verify').send({
        mongo_order_id: order._id, razorpay_order_id: 'order_mock_forged', razorpay_payment_id: 'pay_1', razorpay_signature: signature,
      });
      assert.equal(genuine.status, 200);
      assert.equal(genuine.body.order.isPaid, true);
    } finally {
      delete process.env.RAZORPAY_KEY_ID;
      delete process.env.RAZORPAY_KEY_SECRET;
    }
  });

  test('mock checkout in development pays the order and adjusts stock once', async () => {
    const before = (await Product.findById(product._id)).countInStock;
    const order = await request(app).post('/api/orders').set('Authorization', `Bearer ${userToken}`).send({
      orderItems: [{ _id: product._id, qty: 2, selectedSize: 'M' }],
      shippingAddress: address,
    });
    assert.equal(order.status, 201);
    const rzp = await request(app).post('/api/payment/razorpay').send({ orderId: order.body._id, amount: 1 });
    assert.equal(rzp.status, 200);
    assert.equal(rzp.body.amount, 149900);

    const payload = { mongo_order_id: order.body._id, razorpay_order_id: rzp.body.id, razorpay_payment_id: 'mock', razorpay_signature: 'mock' };
    const first = await request(app).post('/api/payment/verify').send(payload);
    assert.equal(first.status, 200);
    const second = await request(app).post('/api/payment/verify').send(payload);
    assert.equal(second.status, 200);

    const after = (await Product.findById(product._id)).countInStock;
    assert.equal(after, before - 2);
  });

  test('mock payments are refused in production without keys', async () => {
    process.env.NODE_ENV = 'production';
    try {
      const order = await Order.create({
        orderItems: [{ name: 'x', qty: 1, image: 'x', price: 500, product: cheapProduct._id }],
        shippingAddress: address, paymentMethod: 'Razorpay', totalPrice: 500, itemsPrice: 500,
      });
      const res = await request(app).post('/api/payment/razorpay').send({ orderId: order._id });
      assert.equal(res.status, 503);
    } finally {
      process.env.NODE_ENV = 'test';
    }
  });

  test('a 100% coupon order can be confirmed without payment; others cannot', async () => {
    const free = await request(app).post('/api/orders').send({
      orderItems: [{ _id: product._id, qty: 1, selectedSize: 'M' }, { _id: cheapProduct._id, qty: 1 }], shippingAddress: address, couponCode: 'FREE',
    });
    assert.equal(free.body.shippingPrice, 0);
    assert.equal(free.body.totalPrice, 0);
    const ok = await request(app).post('/api/payment/bypass').send({ mongo_order_id: free.body._id });
    assert.equal(ok.status, 200);

    const paid = await request(app).post('/api/orders').send({
      orderItems: [{ _id: cheapProduct._id, qty: 1 }], shippingAddress: address,
    });
    const denied = await request(app).post('/api/payment/bypass').send({ mongo_order_id: paid.body._id });
    assert.equal(denied.status, 400);
  });

  test('signed-in users see their orders; order details are private', async () => {
    const mine = await request(app).get('/api/orders/my').set('Authorization', `Bearer ${userToken}`);
    assert.equal(mine.status, 200);
    assert.ok(mine.body.length >= 1);

    const anon = await request(app).get(`/api/orders/${mine.body[0]._id}`);
    assert.equal(anon.status, 401);
  });

  test('orders can be tracked with order number and email', async () => {
    const order = await Order.findOne({ 'shippingAddress.email': address.email });
    const shortId = String(order._id).slice(-8).toUpperCase();
    const ok = await request(app).post('/api/orders/track').send({ orderNumber: `#${shortId}`, email: address.email });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.success, true);
    const wrong = await request(app).post('/api/orders/track').send({ orderNumber: shortId, email: 'other@example.com' });
    assert.equal(wrong.status, 404);
  });
});

describe('reviews', () => {
  let reviewId;

  test('creating a review requires sign-in', async () => {
    const res = await request(app).post('/api/reviews').send({ productId: product._id, rating: 5, title: 'Great', comment: 'Lovely' });
    assert.equal(res.status, 401);
  });

  test('signed-in buyer gets a verified, pending review', async () => {
    const res = await request(app).post('/api/reviews').set('Authorization', `Bearer ${userToken}`)
      .send({ productId: product._id, rating: 4, title: 'Great fit', comment: 'Lovely print' });
    assert.equal(res.status, 201);
    assert.equal(res.body.review.status, 'pending');
    assert.equal(res.body.review.verified, true);
    reviewId = res.body.review._id;
  });

  test('approval publishes the review and updates the product rating', async () => {
    const res = await request(app).put(`/api/reviews/admin/${reviewId}/approve`).set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    const list = await request(app).get(`/api/reviews/product/${product._id}`);
    assert.equal(list.body.totalReviews, 1);
    assert.equal(list.body.reviews[0].userEmail, undefined);
    const p = await Product.findById(product._id);
    assert.equal(p.rating, 4);
    assert.equal(p.numReviews, 1);
  });
});

describe('bundle offers', async () => {
  const { applyBundleOffers, priceOrder } = await import('../utils/pricing.js');
  const kurta = (price, qty = 1) => ({ product: `k${price}`, category: 'Short Kurtas', price, qty });

  test('pairs the most expensive units and leaves the cheapest one out', () => {
    const r = applyBundleOffers([kurta(1299), kurta(899), kurta(799)]);
    assert.equal(r.discount, 1299 + 899 - 1499);
    assert.deepEqual(r.bundledQty, [1, 1, 0]);
  });

  test('never makes a pair more expensive than buying separately', () => {
    const r = applyBundleOffers([kurta(600, 2)]);
    assert.equal(r.discount, 0);
  });

  test('coupons only apply to units outside a bundle', () => {
    const lines = [kurta(999, 3)];
    const pricing = priceOrder(lines, { discountPercent: 10, active: true, applicableCategories: [] });
    assert.equal(pricing.offerDiscount, 999 * 2 - 1499);
    assert.equal(pricing.discountAmount, 100); // 10% of the one unbundled kurta
  });
});

describe('contact and newsletter', () => {
  test('contact inquiries are stored and visible only to admins', async () => {
    const bad = await request(app).post('/api/contact').send({ name: 'A', email: 'nope', message: 'hello there' });
    assert.equal(bad.status, 400);
    const ok = await request(app).post('/api/contact').send({ name: 'Asha', email: 'asha@example.com', subject: 'wholesale', message: 'Need 200 pieces' });
    assert.equal(ok.status, 201);
    assert.equal((await request(app).get('/api/contact')).status, 401);
    const inbox = await request(app).get('/api/contact').set('Authorization', `Bearer ${adminToken}`);
    assert.equal(inbox.body.inquiries.length, 1);
  });

  test('newsletter subscription is idempotent', async () => {
    for (let i = 0; i < 2; i++) {
      const res = await request(app).post('/api/contact/newsletter').send({ email: 'Fan@Example.com' });
      assert.equal(res.status, 201);
    }
    const inbox = await request(app).get('/api/contact').set('Authorization', `Bearer ${adminToken}`);
    assert.equal(inbox.body.subscribers.length, 1);
  });

  test('latest reviews are public and hide emails', async () => {
    const res = await request(app).get('/api/reviews/latest');
    assert.equal(res.status, 200);
    assert.ok(res.body.reviews.every((r) => r.userEmail === undefined));
  });
});

describe('emails', () => {
  const sent = [];
  const flush = () => new Promise((r) => setTimeout(r, 20));
  let item;

  before(async () => {
    process.env.ADMIN_NOTIFY_EMAIL = 'owner@example.com';
    setMailTransport({ sendMail: async (m) => { sent.push(m); } });
    item = await Product.create({
      user: product.user, name: 'Email Test Kurta', image: '/images/kurta-men.jpg', brand: 'RC', category: 'Long Kurtas',
      description: 'x', price: 1200, countInStock: 5, sizes: ['L'],
    });
  });
  after(() => {
    setMailTransport(null);
    delete process.env.ADMIN_NOTIFY_EMAIL;
  });

  const paidOrder = async (email = 'buyer@example.com') => {
    const order = await request(app).post('/api/orders').send({
      orderItems: [{ _id: item._id, qty: 1, selectedSize: 'L' }],
      shippingAddress: { ...address, email, name: '<b>Asha</b> Verma' },
    });
    const rzp = await request(app).post('/api/payment/razorpay').send({ orderId: order.body._id });
    await request(app).post('/api/payment/verify').send({
      mongo_order_id: order.body._id, razorpay_order_id: rzp.body.id, razorpay_payment_id: 'mock', razorpay_signature: 'mock',
    });
    await flush();
    return order.body;
  };

  test('paying an order emails the customer and the store once', async () => {
    sent.length = 0;
    const order = await paidOrder();
    assert.equal(sent.length, 2);
    const [customer, store] = sent;
    assert.equal(customer.to, 'buyer@example.com');
    assert.match(customer.subject, new RegExp(String(order._id).slice(-8).toUpperCase()));
    assert.match(customer.html, /₹1,270/); // ₹1200 + ₹70 shipping
    assert.match(customer.html, /track-order\?order=/);
    assert.ok(!customer.html.includes('<b>Asha</b>'), 'customer-supplied text is escaped');
    assert.equal(store.to, 'owner@example.com');

    // Verifying again must not resend.
    await request(app).post('/api/payment/verify').send({ mongo_order_id: order._id, razorpay_order_id: 'x' });
    await flush();
    assert.equal(sent.length, 2);
  });

  test('marking an order shipped sends tracking details exactly once', async () => {
    const order = await paidOrder('ship@example.com');
    sent.length = 0;
    const bad = await request(app).put(`/api/orders/${order._id}/status`).set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Shipped', trackingUrl: 'javascript:alert(1)' });
    assert.equal(bad.status, 400);

    const res = await request(app).put(`/api/orders/${order._id}/status`).set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Shipped', courierName: 'Delhivery', awbNumber: 'AWB123', trackingUrl: 'https://track.example.com/AWB123' });
    assert.equal(res.status, 200);
    assert.equal(res.body.awbNumber, 'AWB123');
    await flush();
    assert.equal(sent.length, 1);
    assert.equal(sent[0].to, 'ship@example.com');
    assert.match(sent[0].html, /Delhivery/);
    assert.match(sent[0].html, /https:\/\/track\.example\.com\/AWB123/);

    await request(app).put(`/api/orders/${order._id}/status`).set('Authorization', `Bearer ${adminToken}`).send({ status: 'Shipped' });
    await flush();
    assert.equal(sent.length, 1);
  });

  test('contact messages alert the store with reply-to set', async () => {
    sent.length = 0;
    await request(app).post('/api/contact').send({ name: 'Ravi', email: 'ravi@example.com', subject: 'sizing', message: 'Which size for 40 chest?' });
    await flush();
    assert.equal(sent.length, 1);
    assert.equal(sent[0].replyTo, 'ravi@example.com');
  });

  test('without SMTP settings nothing is sent and orders still work', async () => {
    setMailTransport(null);
    const order = await paidOrder('nosmtp@example.com');
    const saved = await Order.findById(order._id);
    assert.equal(saved.isPaid, true);
    setMailTransport({ sendMail: async (m) => { sent.push(m); } });
  });
});
