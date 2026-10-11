import mongoose from 'mongoose';

// A homepage hero slide managed from the admin. When no slide is active the
// storefront builds its hero from product photos instead.
const slideSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    publicId: { type: String, default: '' },
    eyebrow: { type: String, default: '', trim: true, maxlength: 60 },
    title: { type: String, default: '', trim: true, maxlength: 90 },
    text: { type: String, default: '', trim: true, maxlength: 220 },
    ctaLabel: { type: String, default: '', trim: true, maxlength: 30 },
    ctaLink: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
      // Only site paths or https links, so a slide can never carry a javascript: URL.
      validate: { validator: (v) => !v || /^\/(?!\/)/.test(v) || /^https:\/\//i.test(v), message: 'Link must start with / or https://' },
    },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

slideSchema.index({ active: 1, order: 1 });

const Slide = mongoose.model('Slide', slideSchema);

export default Slide;
