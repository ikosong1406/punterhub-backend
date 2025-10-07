import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Schema for an individual booking code
const BookingCodeSchema = new Schema({
    bookingSite: {
        type: String,
    },
    code: {
        type: String,
    },
    odd: {
        type: Number,
    }
}, { _id: false }); // Set _id to false if you don't need IDs for subdocuments

// Schema for an individual asset
const AssetSchema = new Schema({
    pair: {
        type: String,
    },
    direction: { // e.g., 'buy', 'sell'
        type: String,
        enum: ['buy', 'sell', 'long', 'short'], // Example enum for clarity
    },
    enteryPrice: {
        type: Number,
    },
    takeProfit: {
        type: Number
        // Not required in case it's a manual close
    },
    stopLoss: {
        type: Number
        // Not required in case it's a manual close
    },
    timeFrame: { // e.g., 'H4', 'D1', 'M15'
        type: String
    }
}, { _id: false }); // Set _id to false if you don't need IDs for subdocuments

// Main Tip Schema
const TipSchema = new Schema({
    punterName: {
        type: String,
        trim: true
    },
    punterId: {
        type: mongoose.Schema.Types.ObjectId, // Assuming punterId links to a User/Punter collection
        ref: 'User',
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
    },
    primaryCategory: {
        type: String,
        trim: true
    },
    secondaryCategory: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'closed', 'redeemed'], // Allowed status values
        default: 'active'
    },
    sales: {
        type: Number,
        default: 0,
    },
    expiryTime: {
        type: Date,
    },
    bookingCode: {
        type: [BookingCodeSchema], // Array of BookingCodeSchema objects
        default: []
    },
    assets: {
        type: [AssetSchema], // Array of AssetSchema objects
        default: []
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

export default model('Tip', TipSchema);