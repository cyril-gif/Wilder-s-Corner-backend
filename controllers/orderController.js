import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    // Basic validation
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }
    if (!shippingAddress || !shippingAddress.fullName) {
      return res.status(400).json({ success: false, message: 'Shipping address required' });
    }

    // Prepare order items with product details and reduce stock
    const processedItems = [];
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ₵{item.product} not found` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ success: false, message: `₵{product.name} is out of stock` });
      }

      // Add to order items
      processedItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || '',
        price: product.discountPrice || product.price,
        qty: item.qty,
        size: item.size || '',
        color: item.color || '',
      });

      // Reduce stock
      product.stock -= item.qty;
      product.sold += item.qty;
      await product.save();
    }

    // Create the order
    const order = await Order.create({
      user: req.user._id,
      orderItems: processedItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      isPaid: paymentMethod === 'paystack' ? false : false,
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get logged-in user's orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark order as paid (for Paystack)
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'processing';
    order.paymentResult = {
      id: req.body.id || '',
      status: req.body.status || 'completed',
      email_address: req.body.email_address || '',
    };
    await order.save();
    res.json({ success: true, message: 'Order paid', data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
