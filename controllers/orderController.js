import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }
    
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice
    } = req.body;
    
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }
    
    // Verify stock and enrich order items with product details
    const enrichedItems = [];
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      
      enrichedItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        price: product.discountPrice || product.price,
        qty: item.qty,
        size: item.size,
        color: item.color
      });
      
      // Reduce stock
      product.stock -= item.qty;
      product.sold += item.qty;
      await product.save();
    }
    
    const order = await Order.create({
      user: req.user._id,
      orderItems: enrichedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      isPaid: paymentMethod === 'cash_on_delivery' ? false : false,
      status: 'pending'
    });
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get logged in user's orders
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('orderItems.product', 'name images');
    
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('orderItems.product', 'name images slug');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Check if user owns order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Update order to paid (payment gateway callback)
 * @route   PUT /api/orders/:id/pay
 * @access  Private
 */
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      email_address: req.body.email_address,
      update_time: req.body.update_time
    };
    order.status = 'processing';
    
    await order.save();
    
    res.json({ success: true, message: 'Order marked as paid', data: order });
  } catch (error) {
    console.error('Update to paid error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
