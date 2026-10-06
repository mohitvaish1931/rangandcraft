import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    subject: { type: String, trim: true, maxlength: 60, default: 'general' },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    status: { type: String, enum: ['new', 'replied', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

const Inquiry = mongoose.model('Inquiry', inquirySchema);
export default Inquiry;
