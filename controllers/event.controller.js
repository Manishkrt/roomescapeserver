// EventModel

import EventModel from "../models/event.model.js";
import cloudinary from '../config/cloudinary.config.js';
import EventQueryModel from "../models/eventQuery.model.js";


const uploadImagesToCloudinary = async (files) => {
    try {
        if (!files || files.length === 0) {
            throw new Error("No files provided");
        }

        const uploadPromises = files.map((file) => {
            return new Promise((resolve, reject) => {
                const upload = cloudinary.uploader.upload_stream(
                    { folder: "event" },
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
        });

        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error("Error uploading images to Cloudinary:", error);
        throw new Error("Error uploading images");
    }
};
const uploadImageToCloudinary = async (file) => {
    try {
      if (!file || !file.buffer) {
        throw new Error('File buffer is missing');
      }
      return new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          { folder: 'event' },
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
        const imageId = imageUrl.split('/').slice(-2).join('/').split('.')[0];

        // Delete the image from Cloudinary
        await cloudinary.uploader.destroy(imageId);
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        throw new Error("Error deleting image");
    }
};


export const CreateEvent = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Image file is required' });
          } 
          const imageUrl = await uploadImageToCloudinary(req.file); 
          const newEvent = new EventModel({...req.body, image:imageUrl }); 
          await newEvent.save(); 
          return res.status(201).json({ message: 'Event Added successfully' });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


export const GetEvent = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const total = await EventModel.countDocuments();
        const response = await EventModel.find()
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data: response
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};



export const GetEventSingle = async (req, res) => {
    try {
        let { id } = req.params;
        const response = await EventModel.findById(id)
        if (!response) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const UpdateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await EventModel.findById(id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        let imageUrl = event.image; // Keep the existing image if not updated

        if (req.file) {
            imageUrl = await uploadImageToCloudinary(req.file);
        }

        const updatedEvent = await EventModel.findByIdAndUpdate(
            id,
            { ...req.body, image: imageUrl },
            { new: true }
        );

        return res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const UpdateEvent2 = async (req, res) => {
    try {
        const { id } = req.params;
        const { existingImages } = req.body;
        let images = JSON.parse(existingImages) || [];

        if (req.files && req.files.length > 0) {
            const uploadedImages = await uploadImagesToCloudinary(req.files);
            images = [...images, ...uploadedImages];
        }

        await EventModel.findByIdAndUpdate(id, { ...req.body, images });
        res.json({ message: "Event updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

export const DeleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the event
        const event = await EventModel.findById(id);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Delete images from Cloudinary
        const deleteImagePromises = event.images.map(deleteImageFromCloudinary);
        await Promise.all(deleteImagePromises);

        // Delete event from database
        await EventModel.findByIdAndDelete(id);

        res.json({ success: true, message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const singleEventWithFormApplied = async (req, res) => {
    try {
        let { id } = req.params
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);


        const event = await EventModel.findById(id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const totalApplied = await EventQueryModel.countDocuments({ event: id });

        const appliedForms = await EventQueryModel.find({ event: id })
            .skip((page - 1) * limit)
            .limit(limit);

        res.status(200).json({
            event,
            appliedForms,
            totalApplied,
            totalPages: Math.ceil(totalApplied / limit),
            currentPage: page,
        });
 
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}



