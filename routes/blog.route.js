import express from 'express';
import multer from 'multer';  
import { createBlog, deleteBlog, editBlog, getAllBlogs, getBlogById } from '../controllers/blog.controller.js';

const upload = multer()

const router = express.Router(); 

router.post('/create', upload.single('image') , createBlog); 
router.get('/all', getAllBlogs);
router.get('/single/:id', getBlogById); 
router.put('/update/:id', upload.single('image'), editBlog);
router.delete('/remove/:id', deleteBlog);

export default router;
