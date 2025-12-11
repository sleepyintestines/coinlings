import express from "express"
import Village from "../schemas/Village.js"
import Coinling from "../schemas/Coinling.js"
import { protect } from "../middleware/authm.js"

const router = express.Router();

// get all villages for current user
router.get("/", protect, async (req, res) => {
    try {
        const villages = await Village.find({user: req.user}).sort({createdAt: 1});
        res.json(villages);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

// get single village and its coinlings
router.get("/:id", protect, async (req, res) => {
    try {
        console.log("Fetching village:", {villageId: req.params.id, userId: req.user});
        const village = await Village.findOne({_id: req.params.id, user: req.user});

        if (!village){
            return res.status(404).json({message: "Village not found"});
        } 

        const coinlings = await Coinling.find({village: village._id, dead: false});
        res.json({village, coinlings});
    } catch (err) {
        console.error("Error fetching village:", err);
        res.status(500).json({message: err.message});
    }
});

// update village position (persisting)
router.put("/:id/position", protect, async (req, res) => {
    try {
        const {leftPercent, topPercent} = req.body;
        const village = await Village.findOne({_id: req.params.id, user: req.user});

        if (!village){
            return res.status(404).json({message: "Village not found"});
        }
        if (typeof leftPercent === "number"){
            village.leftPercent = Math.min(Math.max(leftPercent, 0), 100);
        }
        if (typeof topPercent === "number"){
            village.topPercent = Math.min(Math.max(topPercent, 0), 100);
        } 

        await village.save();
        res.json(village);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// merge villages
router.post("/merge", protect, async (req, res) => {
    try{
        const {sourceId, targetId} = req.body;
        console.log("Merge request:", { sourceId, targetId, user: req.user && req.user._id ? req.user._id : req.user });
        // source village = village user is dragging
        const source = await Village.findOne({_id: sourceId, user: req.user});
        // target village = village user is merging into
        const target = await Village.findOne({_id: targetId, user: req.user});

        if(!source || !target){
            return res.status(404).json({message: "One or both villages not found!"});
        }

        const srcCap = Number(source.capacity);
        const tgtCap = Number(target.capacity);
        console.log("Capacities:", { srcCap, tgtCap });

        if(srcCap !== tgtCap){
            return res.status(400).json({message: "Villages must have the same capacity, can't merge!"});
        }

        const valid = [2, 4, 8, 16, 32, 64, 128]
        if(!valid.includes(srcCap)){
            return res.status(400).json({ message: "Invalid capacity for merging!"});
        }

        if(srcCap === 128){
            return res.status(400).json({message: "Already at maximum capacity, can't merge!"});
        }

        const srcCount = await Coinling.countDocuments({village: source._id, dead: false});
        const tgtCount = await Coinling.countDocuments({village: target._id, dead: false});

        if(srcCount < srcCap || tgtCount < tgtCap){
            return res.status(400).json({
                message: "Both villages must be full before merging!",
                source:  `${srcCount}/${srcCap}`,
                target: `${tgtCount}/${tgtCap}`
            });
        }

        // update & upgrade target village
        target.capacity = srcCap * 2;
        await target.save();

        // move residents to target village
        await Coinling.updateMany(
            {village: source._id},
            {$set: {village: target._id}}
        );

        // delete source village
        await Village.deleteOne({_id: source._id});
        res.json({ message: "Villages merged successfully!", mergedVillage: target });
    }catch (err){
        console.error("Merge error:", err);
        res.status(500).json({message: err.message});
    }
});

export default router;