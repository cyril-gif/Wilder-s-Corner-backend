import express from 'express';
import {
  getDashboardStats,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminGetUsers,
  adminUpdateUserRole
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import { uploadMultiple } from '../middleware/uploadMiddleware.js';
import { productValidation } from '../validations/productValidation.js';

const router = express.Router();

// All admin routes require authentication AND admin role
router.use(protect, adminOnly);

router.get('/dashboard-stats', getDashboardStats);

// Product management
router.post('/products', uploadMultiple, productValidation, adminCreateProduct);
router.put('/products/:id', uploadMultiple, adminUpdateProduct);
router.delete('/products/:id', adminDeleteProduct);

// Order management
router.get('/orders', adminGetOrders);
router.put('/orders/:id/status', adminUpdateOrderStatus);

// User management
router.get('/users', adminGetUsers);
router.put('/users/:id/role', adminUpdateUserRole);

export default router;

