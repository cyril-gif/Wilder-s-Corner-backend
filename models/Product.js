import mongoose from 'mongoose';

const attributeSchema = new mongoose.Schema({
  size: [String],
  color: [String],
  material: String,
}, { _id: false });

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0, default: null },
  images: [{ type: String, required: true }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, trim: true },
  stock: { type: Number, required: true, min: 0, default: 0 },
  sold: { type: Number, default: 0 },
  ratings: { type: Number, default: 0, min: 0, max: 5 },
  reviews: [reviewSchema],
  tags: [String],
  attributes: attributeSchema,
  isFeatured: { type: Boolean, default: false },
  isFlashSale: { type: Boolean, default: false },
  flashSaleEnd: { type: Date, default: null },
}, { timestamps: true });

// ✅ Correct pre‑save hook – no 'next' parameter
productSchema.pre('save', async function() {
  if (!this.isModified('slug') && this.slug) return;
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-') + '-' + Date.now();
  }
});

// Method to update average rating
productSchema.methods.updateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.ratings = 0;
    return;
  }
  const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.ratings = total / this.reviews.length;
};

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
