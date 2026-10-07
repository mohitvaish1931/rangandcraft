import nodemailer from 'nodemailer';

// Transactional email. Everything here is best-effort: when SMTP isn't
// configured, or a send fails, the order flow carries on untouched.

const SITE_URL = () => (process.env.SITE_URL || 'https://rangandcraft.store').replace(/\/$/, '');
const BRAND = 'Rang and Craft';
const SUPPORT_PHONE = '+91 93513 25459';
const WHATSAPP_URL = 'https://wa.me/919351325459';

let transport = null;
let testTransport = null;

export const mailConfigured = () =>
  Boolean(testTransport || (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS));

const getTransport = () => {
  if (testTransport) return testTransport;
  if (!mailConfigured()) return null;
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transport;
};

/** Tests swap in a fake transport ({ sendMail }) to capture messages. */
export const setMailTransport = (t) => { testTransport = t; };

const sendMail = async (message) => {
  const t = getTransport();
  if (!t || !message.to) return false;
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || `${BRAND} <${process.env.SMTP_USER}>`,
      replyTo: process.env.MAIL_REPLY_TO || undefined,
      ...message,
    });
    return true;
  } catch (err) {
    console.error(`Email "${message.subject}" to ${message.to} failed:`, err.message);
    return false;
  }
};

// ---------- Formatting helpers ----------

const esc = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;
export const orderNumber = (order) => String(order._id).slice(-8).toUpperCase();
const trackUrl = (order) =>
  `${SITE_URL()}/track-order?order=${orderNumber(order)}&email=${encodeURIComponent(order.shippingAddress?.email || '')}`;
const absoluteImage = (src) => (!src ? '' : /^https?:\/\//.test(src) ? src : `${SITE_URL()}${src.startsWith('/') ? '' : '/'}${src}`);

const layout = ({ preheader, heading, intro, body, cta }) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(heading)}</title></head>
<body style="margin:0;padding:0;background:#faf6ef;font-family:Helvetica,Arial,sans-serif;color:#1d1b18;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf6ef;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fffdf9;border:1px solid #e7dfd3;border-radius:14px;overflow:hidden;">
<tr><td style="background:#1f4645;padding:22px 28px;text-align:center;">
  <a href="${SITE_URL()}" style="color:#ead7bb;text-decoration:none;font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:0.5px;">${BRAND}</a>
  <div style="color:#ffffff;opacity:0.7;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-top:4px;">Jaipur</div>
</td></tr>
<tr><td style="padding:32px 28px 8px;">
  <h1 style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:28px;line-height:1.2;color:#1d1b18;">${esc(heading)}</h1>
  <p style="margin:0;font-size:15px;line-height:1.6;color:#4b453e;">${intro}</p>
</td></tr>
${cta ? `<tr><td style="padding:20px 28px 4px;"><a href="${esc(cta.href)}" style="display:inline-block;background:#1f4645;color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:6px;font-size:13px;letter-spacing:1.5px;text-transform:uppercase;">${esc(cta.label)}</a></td></tr>` : ''}
<tr><td style="padding:20px 28px 28px;">${body}</td></tr>
<tr><td style="padding:20px 28px;background:#f2eadd;font-size:12px;line-height:1.6;color:#6e655b;text-align:center;">
  Questions? Reply to this email, <a href="${WHATSAPP_URL}" style="color:#1f4645;">WhatsApp us</a> or call ${SUPPORT_PHONE} (Mon–Sat, 10 AM – 7 PM).<br>
  ${BRAND} · Jaipur, Rajasthan, India
</td></tr>
</table></td></tr></table></body></html>`;

const itemsTable = (order) => {
  const rows = order.orderItems.map((item) => `
    <tr>
      <td width="64" style="padding:10px 0;border-bottom:1px solid #e7dfd3;">${item.image ? `<img src="${esc(absoluteImage(item.image))}" width="56" height="70" alt="" style="display:block;border-radius:6px;object-fit:cover;">` : ''}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e7dfd3;font-size:14px;line-height:1.4;">
        ${esc(item.name)}<br><span style="color:#6e655b;font-size:12px;">Qty ${item.qty}${item.selectedSize ? ` · Size ${esc(item.selectedSize)}` : ''}</span>
      </td>
      <td align="right" style="padding:10px 0;border-bottom:1px solid #e7dfd3;font-size:14px;white-space:nowrap;">${inr(item.price * item.qty)}</td>
    </tr>`).join('');

  const line = (label, value, color = '#4b453e') =>
    `<tr><td colspan="2" style="padding:4px 0;font-size:14px;color:${color};">${label}</td><td align="right" style="padding:4px 0;font-size:14px;color:${color};">${value}</td></tr>`;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}
    <tr><td colspan="3" style="height:10px;"></td></tr>
    ${line('Subtotal', inr(order.itemsPrice))}
    ${order.offerDiscount > 0 ? line('Bundle offer', `−${inr(order.offerDiscount)}`, '#2d6a4f') : ''}
    ${order.discountAmount > 0 ? line(`Coupon${order.couponCode ? ` (${esc(order.couponCode)})` : ''}`, `−${inr(order.discountAmount)}`, '#2d6a4f') : ''}
    ${line('Shipping', order.shippingPrice > 0 ? inr(order.shippingPrice) : 'Free')}
    <tr><td colspan="2" style="padding:10px 0 0;font-size:16px;font-weight:bold;border-top:1px solid #e7dfd3;">${order.isPaid ? 'Paid' : 'Total'}</td><td align="right" style="padding:10px 0 0;font-size:16px;font-weight:bold;border-top:1px solid #e7dfd3;">${inr(order.totalPrice)}</td></tr>
  </table>`;
};

const addressBlock = (order) => {
  const a = order.shippingAddress || {};
  return `<p style="margin:22px 0 0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6e655b;">Delivering to</p>
    <p style="margin:6px 0 0;font-size:14px;line-height:1.6;color:#1d1b18;">${esc(a.name)}<br>${esc(a.address)}<br>${esc(a.city)} – ${esc(a.postalCode)}<br>${esc(a.phoneNumber)}</p>`;
};

const itemsText = (order) => order.orderItems
  .map((i) => `- ${i.name} × ${i.qty}${i.selectedSize ? ` (Size ${i.selectedSize})` : ''}: ${inr(i.price * i.qty)}`)
  .join('\n');

// ---------- Emails ----------

export const orderConfirmationEmail = (order) => {
  const first = (order.shippingAddress?.name || '').split(' ')[0];
  return {
    to: order.shippingAddress?.email,
    subject: `Order #${orderNumber(order)} confirmed – ${BRAND}`,
    html: layout({
      preheader: `Thank you for your order. We’ll dispatch it within 2–3 working days.`,
      heading: `Thank you${first ? `, ${first}` : ''}!`,
      intro: `Your order <strong>#${orderNumber(order)}</strong> is confirmed. We’re preparing it in our Jaipur studio and will dispatch it within 2–3 working days. Delivery usually takes 4–8 working days after that, and we’ll email you the tracking details as soon as it ships.`,
      cta: { href: trackUrl(order), label: 'Track your order' },
      body: itemsTable(order) + addressBlock(order),
    }),
    text: `Thank you${first ? `, ${first}` : ''}! Your order #${orderNumber(order)} is confirmed.\n\n${itemsText(order)}\n\nTotal: ${inr(order.totalPrice)}\n\nWe’ll dispatch it within 2–3 working days. Track it here: ${trackUrl(order)}\n\nQuestions? WhatsApp ${SUPPORT_PHONE}.`,
  };
};

export const adminNewOrderEmail = (order) => {
  const a = order.shippingAddress || {};
  return {
    to: process.env.ADMIN_NOTIFY_EMAIL,
    subject: `New order #${orderNumber(order)} · ${inr(order.totalPrice)} · ${a.name || 'Guest'}`,
    html: layout({
      preheader: `${order.orderItems.length} item(s) for ${a.city || ''}`,
      heading: 'New paid order',
      intro: `<strong>${esc(a.name)}</strong> (${esc(a.email)}, ${esc(a.phoneNumber)}) placed order <strong>#${orderNumber(order)}</strong>.`,
      cta: { href: `${SITE_URL()}/admin/orders`, label: 'Open in admin' },
      body: itemsTable(order) + addressBlock(order),
    }),
    text: `New order #${orderNumber(order)} from ${a.name} (${a.email}, ${a.phoneNumber})\n\n${itemsText(order)}\n\nTotal: ${inr(order.totalPrice)}\n\nShip to: ${a.address}, ${a.city} – ${a.postalCode}`,
  };
};

export const orderShippedEmail = (order) => {
  const tracking = order.courierName || order.awbNumber
    ? `Your parcel is with <strong>${esc(order.courierName || 'our courier partner')}</strong>${order.awbNumber ? ` (AWB <strong>${esc(order.awbNumber)}</strong>)` : ''}.`
    : 'Your parcel is on its way.';
  return {
    to: order.shippingAddress?.email,
    subject: `Your order #${orderNumber(order)} has shipped – ${BRAND}`,
    html: layout({
      preheader: 'Your Rang and Craft order is on its way.',
      heading: 'Your order is on its way',
      intro: `${tracking} Delivery usually takes 4–8 working days depending on your location.`,
      cta: { href: order.trackingUrl || trackUrl(order), label: order.trackingUrl ? 'Track with courier' : 'Track your order' },
      body: itemsTable(order) + addressBlock(order),
    }),
    text: `Your order #${orderNumber(order)} has shipped${order.courierName ? ` with ${order.courierName}` : ''}${order.awbNumber ? ` (AWB ${order.awbNumber})` : ''}.\n\nTrack it: ${order.trackingUrl || trackUrl(order)}`,
  };
};

export const adminInquiryEmail = (inquiry) => ({
  to: process.env.ADMIN_NOTIFY_EMAIL,
  replyTo: inquiry.email,
  subject: `New message (${inquiry.subject}) from ${inquiry.name}`,
  html: layout({
    preheader: inquiry.message.slice(0, 90),
    heading: 'New website message',
    intro: `<strong>${esc(inquiry.name)}</strong> · ${esc(inquiry.email)}${inquiry.phone ? ` · ${esc(inquiry.phone)}` : ''}<br>Topic: ${esc(inquiry.subject)}`,
    body: `<p style="margin:0;font-size:15px;line-height:1.7;white-space:pre-wrap;">${esc(inquiry.message)}</p>`,
    cta: { href: `${SITE_URL()}/admin/inbox`, label: 'Open inbox' },
  }),
  text: `${inquiry.name} (${inquiry.email}${inquiry.phone ? `, ${inquiry.phone}` : ''}) wrote about ${inquiry.subject}:\n\n${inquiry.message}`,
});

// Fire-and-forget wrappers used by routes: never block or fail a request.
export const notifyOrderPaid = (order) => Promise.all([
  sendMail(orderConfirmationEmail(order)),
  sendMail(adminNewOrderEmail(order)),
]).catch(() => {});

export const notifyOrderShipped = (order) => sendMail(orderShippedEmail(order)).catch(() => false);

/**
 * Call before saving an order whose status may have changed. Returns true
 * (and stamps the order) the first time a paid order becomes Shipped, so the
 * caller sends the shipped email exactly once after the save.
 */
export const claimShippedNotice = (order) => {
  if (order.status !== 'Shipped' || !order.isPaid || order.shippedNotifiedAt) return false;
  order.shippedNotifiedAt = new Date();
  return true;
};

export const notifyInquiry = (inquiry) => sendMail(adminInquiryEmail(inquiry)).catch(() => false);
