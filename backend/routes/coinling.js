import express from "express"
import Coinling from "../schemas/Coinling.js"
import { protect } from "../middleware/authm.js"

const router = express.Router();

// get all coinlings of current user
router.get("/", protect, async (req, res) => {
    try{
        const coinlings = await Coinling.find({user: req.user, dead: false}).sort({createdAt: 1});
        res.json(coinlings);
    }catch (err){
        res.status(500).json({message: err.message});
    }
});

// delete coinlings (mark as dead)
router.delete("/:id", protect, async (req, res) => {
    try{
        const coinling = await Coinling.findOne({_id: req.params.id, user: req.user});
        if(!coinling){
            return res.status(404).json({message: "Coinling not found!"});
        }

        coinling.dead = true;
        await coinling.save();
        res.json(coinling);
    }catch (err){
        res.status(500).json({message: err.message});
    }
});

export default router; 