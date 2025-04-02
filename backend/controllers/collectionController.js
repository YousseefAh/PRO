import asyncHandler from '../middleware/asyncHandler.js';
import Collection from '../models/collectionModel.js';
import Product from '../models/productModel.js';

// @desc    Fetch all root collections (collections without a parent)
// @route   GET /api/collections
// @access  Public
const getCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.find({
    parentCollection: null,
    isActive: true,
  }).populate({
    path: 'products.product',
    select: 'name image price rating numReviews',
  });
  res.json(collections);
});

// @desc    Fetch single collection with its products and sub-collections
// @route   GET /api/collections/:id
// @access  Public
const getCollectionById = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id)
    .populate({
      path: 'products.product',
      select:
        'name image price brand category rating numReviews countInStock description',
    })
    .populate({
      path: 'parentCollection',
      select: 'name image description',
    });

  if (collection) {
    // Sort products by displayOrder
    collection.products.sort((a, b) => a.displayOrder - b.displayOrder);

    // Get sub-collections
    const subCollections = await Collection.find({
      parentCollection: collection._id,
      isActive: true,
    }).select('name image description');

    // Return collection with its products and sub-collections
    return res.json({
      ...collection.toObject(),
      subCollections,
    });
  } else {
    res.status(404);
    throw new Error('Collection not found');
  }
});

// @desc    Fetch all sub-collections for a parent collection
// @route   GET /api/collections/:id/subcollections
// @access  Public
const getSubCollections = asyncHandler(async (req, res) => {
  const parentId = req.params.id;

  const subCollections = await Collection.find({
    parentCollection: parentId,
    isActive: true,
  }).populate({
    path: 'products.product',
    select: 'name image price rating numReviews',
  });

  res.json(subCollections);
});

// @desc    Create a collection
// @route   POST /api/collections
// @access  Private/Admin
const createCollection = asyncHandler(async (req, res) => {
  const { parentCollectionId } = req.body;

  const collection = new Collection({
    name: 'Sample Collection',
    user: req.user._id,
    image: '/images/sample.jpg',
    description: 'Sample description',
    products: [],
    parentCollection: parentCollectionId || null,
    isActive: true,
  });

  const createdCollection = await collection.save();
  res.status(201).json(createdCollection);
});

// @desc    Update a collection
// @route   PUT /api/collections/:id
// @access  Private/Admin
const updateCollection = asyncHandler(async (req, res) => {
  const { name, image, description, parentCollection, isActive } = req.body;

  const collection = await Collection.findById(req.params.id);

  if (collection) {
    // Don't allow circular references
    if (parentCollection && parentCollection === req.params.id) {
      res.status(400);
      throw new Error('A collection cannot be its own parent');
    }

    collection.name = name || collection.name;
    collection.image = image || collection.image;
    collection.description = description || collection.description;
    collection.parentCollection =
      parentCollection || collection.parentCollection;
    collection.isActive =
      isActive !== undefined ? isActive : collection.isActive;

    const updatedCollection = await collection.save();
    res.json(updatedCollection);
  } else {
    res.status(404);
    throw new Error('Collection not found');
  }
});

// @desc    Delete a collection
// @route   DELETE /api/collections/:id
// @access  Private/Admin
const deleteCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);

  if (collection) {
    // Check for sub-collections
    const subCollections = await Collection.countDocuments({
      parentCollection: req.params.id,
    });

    if (subCollections > 0) {
      res.status(400);
      throw new Error(
        'Cannot delete collection with sub-collections. Delete or reassign sub-collections first.'
      );
    }

    await Collection.deleteOne({ _id: collection._id });
    res.json({ message: 'Collection removed' });
  } else {
    res.status(404);
    throw new Error('Collection not found');
  }
});

// @desc    Add product to collection
// @route   POST /api/collections/:id/products
// @access  Private/Admin
const addProductToCollection = asyncHandler(async (req, res) => {
  const { productId, displayOrder = 0 } = req.body;
  const collection = await Collection.findById(req.params.id);
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (collection) {
    // Check if product is already in collection
    const existingProduct = collection.products.find(
      (p) => p.product.toString() === productId
    );

    if (existingProduct) {
      // Update display order if product already exists
      existingProduct.displayOrder = displayOrder;
    } else {
      // Add product to collection
      collection.products.push({
        product: productId,
        displayOrder,
      });
    }

    const updatedCollection = await collection.save();
    res.status(201).json(updatedCollection);
  } else {
    res.status(404);
    throw new Error('Collection not found');
  }
});

// @desc    Remove product from collection
// @route   DELETE /api/collections/:id/products/:productId
// @access  Private/Admin
const removeProductFromCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);

  if (collection) {
    const productExists = collection.products.find(
      (p) => p.product.toString() === req.params.productId
    );

    if (!productExists) {
      res.status(404);
      throw new Error('Product not found in collection');
    }

    collection.products = collection.products.filter(
      (p) => p.product.toString() !== req.params.productId
    );

    const updatedCollection = await collection.save();
    res.json(updatedCollection);
  } else {
    res.status(404);
    throw new Error('Collection not found');
  }
});

// @desc    Update product order in collection
// @route   PUT /api/collections/:id/products/reorder
// @access  Private/Admin
const updateProductsOrder = asyncHandler(async (req, res) => {
  const { productOrders } = req.body;
  const collection = await Collection.findById(req.params.id);

  if (collection) {
    // productOrders is an array of { productId, displayOrder }
    for (const order of productOrders) {
      const productIndex = collection.products.findIndex(
        (p) => p.product.toString() === order.productId
      );

      if (productIndex !== -1) {
        collection.products[productIndex].displayOrder = order.displayOrder;
      }
    }

    const updatedCollection = await collection.save();
    res.json(updatedCollection);
  } else {
    res.status(404);
    throw new Error('Collection not found');
  }
});

export {
  getCollections,
  getCollectionById,
  getSubCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  addProductToCollection,
  removeProductFromCollection,
  updateProductsOrder,
};
