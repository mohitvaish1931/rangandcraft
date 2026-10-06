import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 120 },
    source: { type: String, trim: true, maxlength: 40, default: 'website' },
  },
  { timestamps: true }
);

const Subscriber = mongoose.model('Subscriber', subscriberSchema);
export default Subscriber;
