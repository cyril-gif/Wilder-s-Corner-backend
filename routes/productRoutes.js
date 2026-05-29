import express from 'express';
import {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getFlashSales,
  searchProducts,
  addReview
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { reviewValidation } from '../validations/productValidation.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/flash-sales', getFlashSales);
router.get('/search', searchProducts);
router.get('/:id', getProductById);
router.post('/:id/reviews', protect, reviewValidation, addReview);

export default router;

