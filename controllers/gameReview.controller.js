import GameReviewModel from "../models/gameReview.model.js";

export const AddGameReview = async (req, res) => {
    try {
        const newGameReview = new GameReviewModel({ ...req.body })
        await newGameReview.save()
        res.status(201).json({ message: "review added successfully" })

    } catch (error) {
        console.log(error);

        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const getGameReview = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Default: page 1, 10 reviews per page

        const response = await GameReviewModel.find()
            // .populate("game")
            .populate({ path: "game", select: "name" })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit) // Skip previous pages
            .limit(parseInt(limit)); // Limit results per page

        // .populate({ path: "game", select: "name" })

        const totalReviews = await GameReviewModel.countDocuments(); // Get total review count

        res.status(200).json({
            totalReviews,
            totalPages: Math.ceil(totalReviews / limit),
            currentPage: parseInt(page),
            reviews: response
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: "Server error" });
    }
};


export const DeleteGameReview = async (req, res) => {
    try {
        const { id } = req.params;

        // Delete event from database
        await GameReviewModel.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
