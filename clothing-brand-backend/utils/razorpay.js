import Razorpay from 'razorpay';

export const razorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

export const razorpayClient = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/** Razorpay's own reason for a failed call (its SDK rejects with plain objects, not Errors). */
export const razorpayReason = (err) =>
  err?.error?.description || err?.error?.reason || err?.message || (err?.statusCode ? `Razorpay answered ${err.statusCode}` : 'Unknown error');

/**
 * Checks the live keys with a read-only call (lists at most one order), so a
 * wrong secret or an inactive account shows up in the admin before customers hit it.
 */
export const checkPayments = async () => {
  if (!razorpayConfigured()) {
    return { ok: false, configured: false, message: 'Not set up: add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET on the server.' };
  }
  const keyId = process.env.RAZORPAY_KEY_ID;
  const mode = keyId.startsWith('rzp_live') ? 'live' : 'test';
  try {
    await razorpayClient().orders.all({ count: 1 });
    return { ok: true, configured: true, mode, keyId, message: 'Razorpay accepted the keys.' };
  } catch (err) {
    return { ok: false, configured: true, mode, keyId, status: err?.statusCode || 0, message: razorpayReason(err) };
  }
};
