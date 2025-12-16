import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    type: {type: String, enum: ["add", "subtract"], required: true},
    amount: {type: Number, required: true},
    date: {type: String, required: true},
    notes: {type: String},
    worthIt: {type: Boolean},
    category: {type: String},
}, {timestamps: true});

export default mongoose.model("Transaction", transactionSchema);