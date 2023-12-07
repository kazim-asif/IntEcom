import { Router, response } from 'express';
import upload from '../../middleware/multer.js';
import VerifyRole from '../../middleware/role-verification.js';
import reportProduct from '../../controllers/product/report-product.js';
import multer from 'multer';
import { checkUserReports } from '../../controllers/product/is-reported_by_user.js';
const updateupload = multer()

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../controllers/product/index.js';

import authMiddleware from '../../middleware/auth.js'

const router = Router();

// Get Products
router.get('/', async (req, res) => {
  try {
    const result = await getProducts({query: req.query});
    return res.status(result.status).json(result.data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get Product by ID
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await getProductById({id: id});
    return res.status(result.status).json(result.data);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while fetching the product.' });
  }
});

// Create Product
router.post('/', authMiddleware, VerifyRole({ roleToCheck: 'admin' }), upload, async (req, res) => {
  const { user } = req.user;

  try {
    const result = await createProduct({productData: req.body, imageFile: req.file, user: user});
    return res.status(result.status).json(result.data);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ error: 'An error occurred while creating the product.' });
  }
});

// Update Product
router.put('/:id', authMiddleware, VerifyRole({ roleToCheck: 'admin' }), upload, async (req, res) => {
  const { id } = req.params;
  const { user } = req.user;

  try {
    const result = await updateProduct({id: id, productData: req.body, imageFile: req.file, user: user});
    return res.status(result.status).json(result.data);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while updating the product.' });
  }
});

// Delete Product
router.delete('/:id', authMiddleware, VerifyRole({ roleToCheck: 'admin' }), async (req, res) => {
  const { id } = req.params;
  const { user } = req.user;

  try {
    const result = await deleteProduct({id: id , user: user});
    return res.status(result.status).json(result.message);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while deleting the product.' });
  }
});

// POST request to report a product
router.post('/report', authMiddleware, async (req, res) => {
  try {
    const result = await reportProduct(req.body, req.user); // Pass the request body and user info
    return res.status(result.status).json(result.data);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while reporting the product.' });
  }
});

// Get user-specific reports for a product
router.get('/reports/:productId', authMiddleware, async (req, res) => {
  try {
      const userId = req.user.user._id; // Assuming the user's ID is stored in req.user
      const productId = req.params.productId;
      const result = await checkUserReports(userId, productId);
      
      res.status(result.status).json(result.data);
  } catch (error) {
      res.status(500).json({ error: 'An error occurred while fetching reports.' });
  }
});

export default router;
