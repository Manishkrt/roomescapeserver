import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  totalCustomer: { type: Number, required: true },
  message: { type: String, required: true, trim: true }, 
});


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
  bgImage : {
    type: String,
    required : true,
  },


  gameTime : {
    type: Number, 
    required : true,
    default : 60
  },
  genre : {
    type: String, 
    required : true
  },
  minAge : {
    type: Number, 
    required : true
  },
  difficulty : {
    type: Number, 
    required : true
  },
  frustration : {
    type: Number, 
    required : true
  },
  screwUp : {
    type: Number, 
    required : true
  },
  totalCustomer : {
    type : Number,
    default : 500
  },

  // review: {
  //   type: reviewSchema,  
  //   required: true,
  // },

  headLine : {
    type : String,
    required : true
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

},
{
  timestamps : true
}

);

const GameModel = mongoose.model('Game', gameSchema);

 export default GameModel
