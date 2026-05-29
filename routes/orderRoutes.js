import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import { orderValidation } from '../validations/orderValidation.js';

const router = express.Router();

router.post('/', protect, orderValidation, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderToPaid);

export default router;

