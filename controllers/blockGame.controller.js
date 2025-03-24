// import BlockGameModel from "../models/BlockGameModel.js";

import BlockGameModel from "../models/blockGame.model.js";

import mongoose from "mongoose"; 

export const addBlockGames = async (req, res) => {
    try {
        const { date, game, reason } = req.body;

        if (!date || !Array.isArray(date) || date.length === 0) {
            return res.status(400).json({ message: "Invalid dates array." });
        }
        if (!game || !Array.isArray(game) || game.length === 0) {
            return res.status(400).json({ message: "Invalid games array." });
        }

        // Process all dates
        await Promise.all(
            date.map(async (singleDate) => {
                let existingBlock = await BlockGameModel.findOne({ date: singleDate });

                if (existingBlock) {
                    // ✅ Prevent duplicate game IDs (Convert ObjectId to string before merging)
                    const existingGameIds = existingBlock.game.map(id => id.toString());
                    const newUniqueGames = game.filter(id => !existingGameIds.includes(id.toString()));

                    // ✅ Append only unique new game IDs
                    existingBlock.game = [...existingBlock.game, ...newUniqueGames];
                    existingBlock.reason = reason;
                    await existingBlock.save();
                } else {
                    // Insert new record if the date is not found
                    const newBlock = new BlockGameModel({
                        date: singleDate,
                        game,
                        reason,
                    });
                    await newBlock.save();
                }
            })
        );

        res.status(200).json({ message: "Games blocked successfully!" });
    } catch (error) {
        console.error("Error :", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const addBlockGames2 = async (req, res) => {
    try {
        const { date, game, reason } = req.body;

        if (!date || !Array.isArray(date) || date.length === 0) {
            return res.status(400).json({ message: "Invalid dates array." });
        }
        if (!game || !Array.isArray(game) || game.length === 0) {
            return res.status(400).json({ message: "Invalid games array." });
        }

        // Process all dates concurrently
        await Promise.all(
            date.map(async (singleDate) => {
                let existingBlock = await BlockGameModel.findOne({ date: singleDate });

                if (existingBlock) {
                    // Merge games (avoiding duplicates)
                    const updatedGames = [...new Set([...existingBlock.game, ...game])];
                    existingBlock.game = updatedGames;
                    existingBlock.reason = reason
                    await existingBlock.save();
                } else {
                    // Insert new record if the date is not found
                    const newBlock = new BlockGameModel({
                        date: singleDate,
                        game,
                        reason,
                    });
                    await newBlock.save();
                }
            })
        );

        res.status(200).json({ message: "Games blocked successfully!" });
    } catch (error) {
        console.error("Error :", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
export const getAllBlockGame = async (req, res) => {
    try {
        const response = await BlockGameModel.find()
            .populate({
                path: "game",
                select: "name",  
            });

        res.status(200).json(response);
    } catch (error) {
        console.error("Error :", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

