const express = require('express');
const { body } = require('express-validator')
const adminController = require('../controllers/admin')
const isAuth = require('../middleware/is-auth')

const router = express.Router();

// @route   GET /admin/add-product
// @desc    Add products form 
// @access  Private
router.get('/add-product', isAuth, adminController.getAddProduct);

// @route   POST /admin/add-product
// @desc    Add a product in products collection
// @access  Private
router.post('/add-product', [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat(),
    body('description').isLength({ min: 5, max: 400 }).trim()
], isAuth, adminController.postAddProduct);

// @route   GET /admin/edit-product
// @desc    Edit product form
// @access  Private
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct)

// @route   POST /admin/edit-product
// @desc    Edit a certain product
// @access  Private
router.post('/edit-product', [
    body('title').isString().isLength({ min: 3 }).trim(),
    body('price').isFloat(),
    body('description').isLength({ min: 5, max: 400 }).trim()
],isAuth, adminController.postEditProduct)

// @route   POST /admin/delete-product
// @desc    Delete a certain product
// @access  Private
router.post('/delete-product', isAuth, adminController.deleteProduct)

// @route   GET /admin/products
// @desc    Get all products
// @access  Private
router.get('/products', isAuth, adminController.getProducts);

module.exports = router;