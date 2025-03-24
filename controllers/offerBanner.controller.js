import OfferBannerModel from "../models/offerBanner.model.js";
import cloudinary from '../config/cloudinary.config.js';

const uploadImageToCloudinary = async (file) => {
  try {
    if (!file || !file.buffer) {
      throw new Error('File buffer is missing');
    }
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'banner' },
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


export const addBanner = async(req, res)=>{
    try { 
        if (!req.file) {
          return res.status(400).json({ message: 'Image file is required' });
        } 
        const imageUrl = await uploadImageToCloudinary(req.file); 
        const newBlog = new OfferBannerModel({imageUrl:imageUrl }); 
        await newBlog.save(); 
        return res.status(201).json({ message: 'Banner Uploaded successfully'});
      } catch (error) {
        console.error('Error uploading Banner:', error);
        return res.status(500).json({ message: 'Error uploading Banner', error: error.message });
      }
}

export const getBanner = async(req, res)=>{
    try {
        const response = await OfferBannerModel.find()
        return res.status(200).json(response);
    } catch (error) {
        console.error('Error getting Banner:', error);
        return res.status(500).json({ message: 'Error getting Banner', error: error.message });
    }
}

export const deleteOfferBanner = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find and delete the blog
      const offerBanner = await OfferBannerModel.findByIdAndDelete(id);
      if (!offerBanner) {
        return res.status(404).json({ message: "Blog not found" });
      }
  
      // Delete the image from Cloudinary if it exists
      if (offerBanner.imageUrl) {
        await deleteImageFromCloudinary(offerBanner.imageUrl);
      }
  
      res.status(200).json({ message: "Offer Banner deleted successfully" });
  
    } catch (error) {
      console.error("Error deleting Offer Banner:", error);
      res.status(500).json({ message: error.message });
    }
  };