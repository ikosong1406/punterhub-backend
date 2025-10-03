import express from "express";
import Signal from "../models/signal.schema.js"; // Import the Signal model

const router = express.Router();

// Route to handle posting a new comment to a specific tip/signal
// Endpoint: POST /client/postComment (or whatever you map it to)
router.post("/", async (req, res) => {
    try {
        // 1. Get the necessary data from the request body
        const { signalId, comment, author } = req.body;

        // Note: We use 'author' (username/email) as per your schema, 
        // which you need to pass from the client.

        // 2. Input validation
        if (!signalId || !comment || !author) {
            return res.status(400).json({ 
                status: "error", 
                message: "Signal ID, comment content, and author are required." 
            });
        }

        // 3. Create the new comment object
        const newComment = {
            user: author, // Maps to the 'user' field in commentSchema
            comment: comment,
            // Mongoose handles 'createdAt' via the commentSchema timestamps option
        };

        // 4. Find the signal and push the new comment into the 'comments' array
        const updatedSignal = await Signal.findByIdAndUpdate(
            signalId,
            {
                $push: { 
                    comments: newComment 
                }
            },
            { 
                new: true, // Return the updated document
                runValidators: true // Ensure the commentSchema validators run
            }
        );

        // 5. Check if the signal was found and updated
        if (!updatedSignal) {
            return res.status(404).json({ status: "error", message: "Tip/Signal not found." });
        }

        // 6. Success response
        res.status(200).json({
            status: "ok",
            message: "Comment posted successfully.",
            data: {
                comment: updatedSignal.comments[updatedSignal.comments.length - 1] // Return the new comment
            },
        });

    } catch (error) {
        // Handle specific error for invalid MongoDB ID format
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ status: "error", message: "Invalid Signal ID format." });
        }
        // Handle other server errors (e.g., validation failures)
        res.status(500).json({ 
            status: "error", 
            message: "Failed to post comment due to server error.", 
            details: error.message 
        });
    }
});

export default router;