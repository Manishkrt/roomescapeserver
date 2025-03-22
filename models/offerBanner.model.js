import mongoose from 'mongoose';

const offerBannerSchema = new mongoose.Schema({
    imageUrl: {
        type: String,   
        required: true,   
    }
});

const OfferBannerModel =  mongoose.model('OfferBanner', offerBannerSchema);

 export default OfferBannerModel