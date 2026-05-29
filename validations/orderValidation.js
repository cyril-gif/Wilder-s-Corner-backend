import { body } from 'express-validator';

export const orderValidation = [
  body('orderItems')
    .isArray({ min: 1 }).withMessage('At least one item required'),
  body('shippingAddress')
    .isObject().withMessage('Shipping address required'),
  body('shippingAddress.fullName')
    .notEmpty().withMessage('Full name required'),
  body('shippingAddress.phone')
    .notEmpty().withMessage('Phone number required'),
  body('shippingAddress.addressLine1')
    .notEmpty().withMessage('Address line required'),
  body('shippingAddress.city')
    .notEmpty().withMessage('City required'),
  body('shippingAddress.state')
    .notEmpty().withMessage('State required'),
  body('paymentMethod')
    .isIn(['cash_on_delivery', 'card', 'paystack']).withMessage('Invalid payment method'),
  body('totalPrice')
    .isFloat({ min: 0 }).withMessage('Total price must be positive')
];

