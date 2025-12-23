import mongoose from "mongoose"

const houseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, default: "House" },
    leftPercent: { type: Number, required: true, min: 0, max: 100 },
    topPercent: { type: Number, required: true, min: 0, max: 100 },
    capacity: { type: Number, default: 2 },
    createdAt: { type: Date, default: Date.now },
    deleted: {type: Boolean, default: false}
}, {timestamps: true});

// indexes for faster queries
houseSchema.index({ user: 1, deleted: 1 });
houseSchema.index({ _id: 1, user: 1, deleted: 1 });

export default mongoose.model("House", houseSchema);