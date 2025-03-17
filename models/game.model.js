import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true, trim : true, lowercase: true },
  description: String,
  minParticipent : {
    type: Number,
    required : true,
  },
  maxParticipent : {
    type: Number,
    required : true,
  },
  thumbnail : {
    type: String,
    required : true,
  },
  status : {
    type: Boolean,
    required : true,
    default : true
  },
  bookingAvailable : {
    type: Boolean,
    required : true,
    default : true
  } 

});

const GameModel = mongoose.model('Game', gameSchema);

 export default GameModel
