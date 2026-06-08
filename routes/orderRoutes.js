import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  publicTrackOrder,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { orderValidation } from '../validations/orderValidation.js';

const router = express.Router();
router.get('/track/:id', publicTrackOrder);
router.route('/').post(protect, orderValidation, createOrder);
router.route('/my-orders').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);

export default router;
