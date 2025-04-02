import express from 'express';
const router = express.Router();
import {
  getCollections,
  getCollectionById,
  getSubCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  addProductToCollection,
  removeProductFromCollection,
  updateProductsOrder,
} from '../controllers/collectionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import checkObjectId from '../middleware/checkObjectId.js';

router.route('/').get(getCollections).post(protect, admin, createCollection);

router
  .route('/:id')
  .get(checkObjectId, getCollectionById)
  .put(protect, admin, checkObjectId, updateCollection)
  .delete(protect, admin, checkObjectId, deleteCollection);

router.route('/:id/subcollections').get(checkObjectId, getSubCollections);

router
  .route('/:id/products')
  .post(protect, admin, checkObjectId, addProductToCollection);

router
  .route('/:id/products/:productId')
  .delete(protect, admin, checkObjectId, removeProductFromCollection);

router
  .route('/:id/products/reorder')
  .put(protect, admin, checkObjectId, updateProductsOrder);

export default router;
