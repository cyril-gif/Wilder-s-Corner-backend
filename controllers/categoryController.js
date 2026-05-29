import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('name slug image description')
      .sort('name');
    
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get single category by slug
 * @route   GET /api/categories/:slug
 * @access  Public
 */
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug, isActive: true });
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get products by category slug with filtering
 * @route   GET /api/categories/:slug/products
 * @access  Public
 */
export const getCategoryProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12, sort = '-createdAt', minPrice, maxPrice, brand } = req.query;
    
    const category = await Category.findOne({ slug, isActive: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    // Build filter
    const filter = { category: category._id };
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (brand) filter.brand = brand;
    
    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'price_asc': sortOption = { price: 1 }; break;
      case 'price_desc': sortOption = { price: -1 }; break;
      case 'rating': sortOption = { ratings: -1 }; break;
      case 'newest': sortOption = { createdAt: -1 }; break;
      default: sortOption = { createdAt: -1 };
    }
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('category', 'name slug');
    
    const total = await Product.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        category,
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
    console.error('Get category products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

