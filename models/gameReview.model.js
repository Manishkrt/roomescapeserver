import mongoose from 'mongoose';

const GameReviewSchema = new mongoose.Schema({
    game: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    }, 
    message: {
        type: String,
        required: true,
        trim: true
    },

},
    { timestamps: true }
);

const GameReviewModel = mongoose.model('GameReview', GameReviewSchema);
export default GameReviewModel;
