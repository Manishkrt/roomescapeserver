
import BlogModel from '../models/blog.model.js';
import cloudinary from '../config/cloudinary.config.js';

const uploadImageToCloudinary = async (file) => {
  try {
    if (!file || !file.buffer) {
      throw new Error('File buffer is missing');
    }
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'blog' },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );
      upload.end(file.buffer);
    });
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Error uploading image');
  }
};

const deleteImageFromCloudinary = async (imageUrl) => {
  try {
    // Extract the public ID from the Cloudinary URL
    const imageId = imageUrl.split('/').slice(-2).join('/').split('.')[0];  // Extract image ID

    // Delete the image from Cloudinary using the imageId
    await cloudinary.uploader.destroy(imageId);
    return
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new Error('Error deleting image');
  }
};


// Controller function to create a new blog
export const createBlog = async (req, res) => { 
  try { 
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    } 
    const imageUrl = await uploadImageToCloudinary(req.file); 
    const newBlog = new BlogModel({...req.body, image:imageUrl }); 
    await newBlog.save(); 
    return res.status(201).json({ message: 'Blog uploaded successfully', blog: newBlog });
  } catch (error) {
    console.error('Error uploading blog:', error);
    return res.status(500).json({ message: 'Error uploading blog', error: error.message });
  }
};



// Controller function to get all blogs
export const getAllBlogs = async (req, res) => {
  try { 
    const blogs = await BlogModel.find({}); 
    return res.status(200).json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return res.status(500).json({ message: 'Error fetching blogs', error: error.message });
  }
};



export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;   
    const blog = await BlogModel.findById(id);
    if (!blog) {
      return res.status(400).json({ message: 'Blog not found' });
    } 
    return res.status(200).json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    return res.status(500).json({ message: 'Error fetching blog', error: error.message });
  }
};


export const editBlog = async (req, res) => {
  try {
    const { id } = req.params;  // Get blog ID from request params
    const { title, shortDescription, imageAlt, description, oldImage } = req.body; // Get updated fields


    
    const blog = await BlogModel.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    } 
    blog.title = title;
    blog.description = description;
    blog.shortDescription = shortDescription;
    blog.imageAlt = imageAlt; 
 
    if (req.file) { 
      const imageUrl = await uploadImageToCloudinary(req.file);
      blog.image = imageUrl
      await deleteImageFromCloudinary(oldImage);
    }
    else{
        blog.image = oldImage
        await deleteImageFromCloudinary(oldImage);
    }  
    await blog.save(); 
    return res.status(200).json({ message: 'Blog updated successfully', blog });
  } catch (error) {
    console.error('Error updating blog:', error);
    return res.status(500).json({ message: 'Error updating blog', error: error.message });
  }
};


export const deleteBlog = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find and delete the blog
      const blog = await BlogModel.findByIdAndDelete(id);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
  
      // Delete the image from Cloudinary if it exists
      if (blog.image) {
        await deleteImageFromCloudinary(blog.image);
      }
  
      res.status(200).json({ message: "Blog deleted successfully" });
  
    } catch (error) {
      console.error("Error deleting blog:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
