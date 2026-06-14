import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = '-createdAt',
      category,
      minPrice,
      maxPrice,
      brand,
      rating,
      inStock,
      search,
      isFeatured,
      isFlashSale
    } = req.query;

    const filter = {};

    // Category filter
    // Category filter - converts slug to ID
if (category) {
  const categoryDoc = await Category.findOne({ slug: category });
  if (categoryDoc) {
    filter.category = categoryDoc._id;
  } else {
    // If category not found, return empty results
    return res.json({ success: true, data: { products: [], pagination: {} } });
  }
}

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (brand) filter.brand = brand;
    if (rating) filter.ratings = { $gte: Number(rating) };
    if (inStock === 'true') filter.stock = { $gt: 0 };
    if (isFeatured === 'true') filter.isFeatured = true;
    if (isFlashSale === 'true') {
      filter.isFlashSale = true;
      filter.flashSaleEnd = { $gt: new Date() };
    }
    if (search) {
      filter.$text = { $search: search };
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { ratings: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'popularity':
        sortOption = { sold: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let product;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).populate('category', 'name slug');
    } else {
      product = await Product.findOne({ slug: id }).populate('category', 'name slug');
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviews = await Review.find({ product: product._id })
      .populate('user', 'name')
      .sort('-createdAt');

    res.json({
      success: true,
      data: { ...product.toObject(), reviews }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, stock: { $gt: 0 } })
      .limit(8)
      .populate('category', 'name slug');
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Get featured error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get flash sale products
// @route   GET /api/products/flash-sales
// @access  Public
export const getFlashSales = async (req, res) => {
  try {
    const products = await Product.find({
      isFlashSale: true,
      flashSaleEnd: { $gt: new Date() },
      stock: { $gt: 0 }
    })
      .limit(10)
      .populate('category', 'name slug');
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Get flash sales error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Search products
// @route   GET /api/products/search?q=query
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }

    const products = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .populate('category', 'name slug');

    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Add review to product
// @route   POST /api/products/:id/reviews
// @access  Private
// Add review to product
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({ user: req.user._id, product: productId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    // Create the review
    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment,
    });

    // Add the review ID to product's reviews array
    product.reviews.push(review._id);
    
    // Recalculate average rating using aggregation
    const agg = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const avgRating = agg.length > 0 ? agg[0].avgRating : 0;
    product.ratings = avgRating;
    
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review,
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
