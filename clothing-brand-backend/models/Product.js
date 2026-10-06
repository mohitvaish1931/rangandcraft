import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
      default: [],
    },
    image: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    originalPrice: {
      type: Number,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    dimensions: {
      type: String,
      default: '',
    },
    weight: {
      type: String,
      default: '',
    },
    materials: {
      type: [String],
      default: [],
    },
    specifications: {
      type: [String],
      default: [],
    },
    careInstructions: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    shapes: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    soldOut: {
      type: Boolean,
      default: false,
    },
    isBOGO: {
      type: Boolean,
      default: false,
    },
    showOnHomepage: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ displayOrder: 1, createdAt: -1 });
productSchema.index({ category: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
