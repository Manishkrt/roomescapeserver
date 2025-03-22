import mongoose from 'mongoose';

// Define Blog Schema
const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  imageAlt: {
    type: String,
    required: true,
  }, 
  description: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,   
});

// Create and export the model
const BlogModel = mongoose.model('Blog', BlogSchema);
export default BlogModel;
