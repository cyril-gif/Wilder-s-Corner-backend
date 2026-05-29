import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import { uploadMultipleImages, deleteImage } from '../utils/cloudinaryUpload.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard-stats
 * @access  Private/Admin
 */
export const getDashboardStats = async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    const ordersCount = await Order.countDocuments();
    const productsCount = await Product.countDocuments();
    const usersCount = await User.countDocuments({ role: 'user' });
    
    const recentOrders = await Order.find()
      .sort('-createdAt')
      .limit(10)
      .populate('user', 'name');
    
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .select('name stock images')
      .limit(5);
    
    res.json({
      success: true,
      data: {
        totalSales: totalSales[0]?.total || 0,
        ordersCount,
        productsCount,
        usersCount,
        recentOrders,
        lowStockProducts
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Create product (admin)
 * @route   POST /api/admin/products
 * @access  Private/Admin
 */
export const adminCreateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    
    const {
      name, slug, description, price, discountPrice,
      category, brand, stock, tags, attributes,
      isFeatured, isFlashSale, flashSaleEnd
    } = req.body;
    
    // Check category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ success: false, message: 'Invalid category' });
    }
    
    // Handle image uploads (files from multer)
    let images = [];
    if (req.files && req.files.length > 0) {
      const buffers = req.files.map(file => file.buffer);
      images = await uploadMultipleImages(buffers, 'products');
    }
    
    const product = await Product.create({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-') + Date.now(),
      description,
      price,
      discountPrice: discountPrice || null,
      images,
      category,
      brand,
      stock,
      tags: tags ? JSON.parse(tags) : [],
      attributes: attributes ? JSON.parse(attributes) : {},
      isFeatured: isFeatured === 'true',
      isFlashSale: isFlashSale === 'true',
      flashSaleEnd: flashSaleEnd || null
    });
    
    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    console.error('Admin create product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update product (admin)
 * @route   PUT /api/admin/products/:id
 * @access  Private/Admin
 */
export const adminUpdateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    const {
      name, description, price, discountPrice,
      category, brand, stock, tags, attributes,
      isFeatured, isFlashSale, flashSaleEnd
    } = req.body;
    
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (stock !== undefined) product.stock = stock;
    if (tags) product.tags = JSON.parse(tags);
    if (attributes) product.attributes = JSON.parse(attributes);
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true';
    if (isFlashSale !== undefined) product.isFlashSale = isFlashSale === 'true';
    if (flashSaleEnd) product.flashSaleEnd = flashSaleEnd;
    
    // Handle new images upload
    if (req.files && req.files.length > 0) {
      const buffers = req.files.map(file => file.buffer);
      const newImages = await uploadMultipleImages(buffers, 'products');
      product.images.push(...newImages);
    }
    
    await product.save();
    res.json({ success: true, message: 'Product updated', data: product });
  } catch (error) {
    console.error('Admin update product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete product (admin)
 * @route   DELETE /api/admin/products/:id
 * @access  Private/Admin
 */
export const adminDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Delete images from Cloudinary
    for (const imageUrl of product.images) {
      await deleteImage(imageUrl);
    }
    
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Admin delete product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get all orders (admin)
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
export const adminGetOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    const orders = await Order.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email');
    
    const total = await Order.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update order status (admin)
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private/Admin
 */
export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    order.status = status;
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    if (status === 'cancelled') {
      // Restore stock
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.qty;
          product.sold -= item.qty;
          await product.save();
        }
      }
    }
    
    await order.save();
    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    console.error('Admin update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get all users (admin)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
export const adminGetUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -refreshToken');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update user role (admin)
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
export const adminUpdateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({ success: true, message: 'User role updated', data: { _id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Admin update user role error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

