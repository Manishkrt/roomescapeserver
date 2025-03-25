import cloudinary from '../config/cloudinary.config.js';
import GameModel from '../models/game.model.js';
import GameReviewModel from '../models/gameReview.model.js';


// Function to upload an image to Cloudinary
const uploadImageToCloudinary = async (file) => {
  try {
    if (!file || !file.buffer) {
      throw new Error('File buffer is missing');
    }
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder: 'game' },
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
    const imageId = imageUrl.split('/').slice(-2).join('/').split('.')[0];    
    await cloudinary.uploader.destroy(imageId);
    return
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new Error('Error deleting image');
  }
};

 
export const createGame = async (req, res) => {
  try { 
    let {bgImage, thumbnail} = req.files  
    if(thumbnail){
      const imageUrl = await uploadImageToCloudinary(thumbnail[0]);
      thumbnail = imageUrl 
    }
    if(bgImage){
      const imageUrl = await uploadImageToCloudinary(bgImage[0]);
      bgImage = imageUrl 
    }  
    const newGame = new GameModel({ ...req.body, thumbnail, bgImage, }); 
    await newGame.save();

    res.status(201).json({
      message: 'Game created successfully',
      game: newGame,
    });
  } catch (error) {
    console.error('Error creating game:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all games.
 */
export const getAllGames = async (req, res) => {
  try {
    const games = await GameModel.find();
    return res.status(200).json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
 

export const getAllClientsGames = async (req, res) => {
  try {
    const games = await GameModel.aggregate([
      { $match: { status: true } },
      {
        $lookup: {
          from: "gamereviews", // Ensure this matches your actual collection name
          localField: "_id",
          foreignField: "game",
          as: "reviews"
        }
      },
      {
        $addFields: {
          totalReview: { $size: "$reviews" } // Count total reviews
        }
      },
      { $project: { bookings: 0 } } // Exclude bookings if not needed
    ]);

    return res.status(200).json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Server error" });
  }
};  

export const singleGame = async (req, res) => {
  const {id} = req.params
  try {
    const game = await GameModel.findById(id);
    return res.status(200).json(game);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


/**
 * Update a game by its ID.
 * Expected request body may include any of: { name, description, maxParticipent }
 */ 
export const updateGame = async (req, res) => {
  const { id } = req.params; 
  const {name, description, minParticipent, maxParticipent, oldThumbnail, gameTime, genre , minAge, difficulty , frustration, screwUp, headLine, oldBgImage } = req.body;
  // const review = JSON.parse(req.body.review);
 
  const {bgImage, thumbnail} = req.files 
  
  try {

    const gameData = await GameModel.findById(id)
    if (!gameData) {
      return res.status(404).json({ error: 'Game not found' });
    } 

    gameData.name = name;
    gameData.description = description;
    gameData.minParticipent = minParticipent;
    gameData.maxParticipent = maxParticipent;
    gameData.gameTime = gameTime;
    gameData.genre = genre;
    gameData.minAge = minAge;
    gameData.difficulty = difficulty;
    gameData.frustration = frustration;
    gameData.screwUp = screwUp;
    // gameData.review = review;
    gameData.headLine = headLine;

    if(thumbnail){
      const imageUrl = await uploadImageToCloudinary(thumbnail[0]);
      gameData.thumbnail = imageUrl
      await deleteImageFromCloudinary(oldThumbnail)
    }
    if(bgImage){
      const imageUrl = await uploadImageToCloudinary(bgImage[0]);
      gameData.bgImage = imageUrl
      await deleteImageFromCloudinary(oldBgImage)
    } 
    await gameData.save() 
    res.status(200).json({
      message: 'Game updated successfully',
      game: gameData,
    });
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Delete a game by its ID.
 */
export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedGame = await GameModel.findByIdAndDelete(id);

    if (!deletedGame) {
      return res.status(404).json({ error: 'Game not found' });
    }

    await deleteImageFromCloudinary(deletedGame.thumbnail)

    res.status(200).json({
      message: 'Game deleted successfully',
      game: deletedGame,
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


export const UpdateBookingAvailable = async (req, res) => {
  try {
    const { id } = req.params;
    const {value} = req.body 
    const updatedGame = await GameModel.findByIdAndUpdate(id, {$set : {bookingAvailable : value}});

    if (!updatedGame) {
      return res.status(404).json({ error: "Game not found" });
    }
  
    res.status(200).json({ message: 'success'});
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const UpdateGameStatus = async (req, res) => {
  
  try {
    const { id } = req.params;
    const {value} = req.body  
    const updatedGame = await GameModel.findByIdAndUpdate(id, {$set : {status : value}});

    if (!updatedGame) {
      return res.status(404).json({ error: "Game not found" });
    }
  
    res.status(200).json({ message: 'success'});
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
