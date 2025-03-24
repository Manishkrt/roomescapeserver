import mongoose from 'mongoose';

const BlockGameSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: { expires: '1d' } // Auto-delete after 1 day
  },
  game: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game', 
    }
  ],
  reason: {
    type: String,
  },
});

// Ensure the TTL index is applied correctly
BlockGameSchema.index({ date: 1 }, { expireAfterSeconds: 86400 });

const BlockGameModel = mongoose.model('BlockGame', BlockGameSchema);
export default BlockGameModel;
