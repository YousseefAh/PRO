import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import collections from './data/collections.js';
import User from './models/userModel.js';
import Product from './models/productModel.js';
import Collection from './models/collectionModel.js';

dotenv.config();

// Hard-code the connection string or use environment variable
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/proshop';

mongoose
  .connect(mongoURI)
  .then(() => console.log('MongoDB Connected'.green.bold))
  .catch((err) => {
    console.error(`Error: ${err.message}`.red.bold);
    process.exit(1);
  });

const importCollections = async () => {
  try {
    // Get the admin user
    const adminUser = await User.findOne({ isAdmin: true });

    if (!adminUser) {
      console.log('No admin user found. Make sure to import users first.'.red);
      process.exit(1);
    }

    // Get all products
    const allProducts = await Product.find({});

    if (allProducts.length === 0) {
      console.log('No products found. Make sure to import products first.'.red);
      process.exit(1);
    }

    // Clear existing collections
    await Collection.deleteMany({});

    console.log('Creating main collections...'.yellow);

    // Create root collections (no products at this level)
    for (let i = 0; i < collections.length; i++) {
      const collectionData = collections[i];
      const { subCollections, ...parentCollectionData } = collectionData;

      // Root collections don't have products directly
      const parentCollection = new Collection({
        ...parentCollectionData,
        user: adminUser._id,
        products: [], // No products at root level
      });

      const savedParentCollection = await parentCollection.save();
      console.log(
        `Created root collection: ${savedParentCollection.name}`.green
      );

      // Create sub-collections
      if (subCollections && subCollections.length > 0) {
        console.log(
          `Creating sub-collections for ${savedParentCollection.name}...`.yellow
        );

        for (let j = 0; j < subCollections.length; j++) {
          const subCollectionData = subCollections[j];

          // Distribute products among sub-collections
          // Calculate product range based on collection index and sub-collection index
          const productsPerSubCollection = Math.ceil(
            allProducts.length / (collections.length * subCollections.length)
          );
          const startIdx =
            (i * subCollections.length + j) * productsPerSubCollection;
          const endIdx = startIdx + productsPerSubCollection;

          // Make sure we don't exceed the array boundaries
          const subCollectionProducts = allProducts
            .slice(startIdx, Math.min(endIdx, allProducts.length))
            .map((product, index) => ({
              product: product._id,
              displayOrder: index,
            }));

          // Create the sub-collection with products
          const subCollection = new Collection({
            ...subCollectionData,
            user: adminUser._id,
            parentCollection: savedParentCollection._id,
            products: subCollectionProducts,
          });

          const savedSubCollection = await subCollection.save();
          console.log(
            `Created sub-collection: ${savedSubCollection.name} with ${subCollectionProducts.length} products`
              .green
          );
        }
      }
    }

    console.log('All collections successfully imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

importCollections();
