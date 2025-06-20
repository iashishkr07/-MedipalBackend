import express from 'express';
import { addDoctor, loginAdmin } from '../controllers/adminController.js';
import upload from '../middlewares/upload.js';

const adminRouter = express.Router();

// Add a doctor 
adminRouter.post('/add-doctor', upload.single('image'), addDoctor);

// Admin login
adminRouter.post('/admin/login', loginAdmin);

export default adminRouter;

