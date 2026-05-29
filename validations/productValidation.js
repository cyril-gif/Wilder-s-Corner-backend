import { body } from 'express-validator';

export const productValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 3, max: 200 }),
  body('description')
    .notEmpty().withMessage('Description is required'),
  body('price')
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('category')
    .notEmpty().withMessage('Category is required'),
  body('stock')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

export const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ max: 1000 })
];
