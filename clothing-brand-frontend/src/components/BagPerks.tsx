import { Gift, Truck } from 'lucide-react';
import { formatPrice } from '../lib/format';
import { FREE_SHIPPING_THRESHOLD, type BagEstimate } from '../lib/offers';

/** Free-shipping progress, applied bundle savings and a gentle "one more" nudge. */
const BagPerks = ({ estimate }: { estimate: BagEstimate }) => {
  const merchandise = estimate.itemsPrice - estimate.offerDiscount;
  const progress = Math.min(100, (merchandise / FREE_SHIPPING_THRESHOLD) * 100);
  const unlocked = estimate.toFreeShipping === 0;

  return (
    <div className="rc-perks-box" aria-live="polite">
      <div className="rc-perks-box__row">
        <Truck size={16} strokeWidth={1.6} aria-hidden />
        {unlocked ? (
          <span>You’ve unlocked <strong>free shipping</strong></span>
        ) : (
          <span>Add <strong>{formatPrice(estimate.toFreeShipping)}</strong> more for <strong>free shipping</strong></span>
        )}
      </div>
      <div className="rc-perks-box__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="Progress to free shipping">
        <span style={{ width: `${progress}%` }} className={unlocked ? 'is-done' : ''} />
      </div>
      {estimate.offerDiscount > 0 && (
        <div className="rc-perks-box__row rc-perks-box__row--good">
          <Gift size={16} strokeWidth={1.6} aria-hidden />
          <span>Bundle offer applied — you save <strong>{formatPrice(estimate.offerDiscount)}</strong></span>
        </div>
      )}
      {estimate.nudge && (
        <div className="rc-perks-box__row">
          <Gift size={16} strokeWidth={1.6} aria-hidden />
          <span>Add 1 more {estimate.nudge.noun} to get <strong>{estimate.nudge.label.replace(/^Any /, 'any ')}</strong></span>
        </div>
      )}
    </div>
  );
};

export default BagPerks;
