const Product = require('../models/Products')
const { validationResult } = require('express-validator')

const fileHelper = require('../util/file')

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add a product',
    path: '/admin/add-product',
    editing: false,
  })
}

exports.postAddProduct = (req, res, next) => {
  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    console.log('postSddProduct:' ,errors)
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      errorMessage: errors.array()[0].msg,
      
    })
  } 

  const product = new Product({
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    image: req.file.path,
    userId: req.user
  })
  product.save().then(() => {
    res.redirect('/')
  }).catch(err => console.log(err))
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit
  if (!editMode) {
    return res.redirect('/')
  }
  Product.findById(req.params.productId)
    .then((product) => {
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
      })
    })
    .catch((err) => console.log(err))
}

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId
  const updatedTitle = req.body.title
  const updatedPrice = req.body.price
  const updateDesc = req.body.description
  const updatedImage = req.file?.path

  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    console.log('postSddProduct:' ,errors)
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      errorMessage: errors.array()[0].msg,
      
    })
  } 

  Product.findById(prodId).then(product => {
    product.title = updatedTitle,
    product.price = updatedPrice,
    product.description = updateDesc
    if(updatedImage) {
      fileHelper.deleteFile(product.image)
      product.image = updatedImage
    } else {
      product.image = updatedImage
    }
    return product.save()
  })
  .then(() => {
    res.redirect('/admin/products')
  })
  .catch(err => console.log(err))
}

exports.deleteProduct = (req, res, next) => {
  const prodId = req.body.productId
  Product.findByIdAndRemove(prodId).then(() => {
    console.log('DESTROYED PRODUCT')
    res.redirect('/')
  }).catch(err => console.log(err))
}

exports.getProducts = (req, res, next) => {
  Product.find()
    .populate('userId', 'name -_id')
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
      });
    })
    .catch(err => console.log(err));
};