import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  image: {
    type: String, // Cloudinary URL
    required: false
  },
  description: {
    type: String,
    maxlength: 500
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Pre-save middleware to generate slug from name if not provided
categorySchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
export default Category;

