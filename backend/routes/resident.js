import express from "express"
import Resident from "../schemas/Resident.js"
import { protect } from "../middleware/authm.js"
import House from "../schemas/House.js";

const router = express.Router();

// get all residents of current user
router.get("/", protect, async (req, res) => {
    try {
        const residents = await Resident.find({ user: req.user, dead: false }).sort({ createdAt: 1 });
        res.json(residents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// delete residents (mark as dead)
router.delete("/:id", protect, async (req, res) => {
    try {
        const resident = await Resident.findOne({ _id: req.params.id, user: req.user });
        if (!resident) {
            return res.status(404).json({ message: "Resident not found!" });
        }

        resident.dead = true;
        await resident.save();
        res.json(resident);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// rename resident
router.patch("/:id/name", protect, async (req, res) => {
    try{
        const userId = req.user;
        const {id} = req.params;
        const {name} = req.body;

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({ error: "Invalid name!" });
        }

        // only update if it belongs to current user
        const resident = await Resident.findOneAndUpdate(
            { _id: id, user: userId },
            { name: name.trim() },
            { new: true }
        );

        if (!resident) {
            return res.status(404).json({ error: "Resident not found or unauthorized!" });
        }

        res.json(resident);
    }catch (err){
        res.status(500).json({message: err.message});
    }

});

// move resident across houses
router.patch("/:id/house", protect, async (req, res) => {
    try{
        const {houseId} = req.body;
        
        // fetch resident, destination, and count in parallel
        const [resident, destination, count] = await Promise.all([
            Resident.findOne({
                _id: req.params.id,
                user: req.user,
                dead: false
            }),
            House.findOne({
                _id: houseId,
                user: req.user,
                deleted: false
            }),
            Resident.countDocuments({
                house: houseId,
                dead: false
            })
        ]);

        if (!resident){
            return res.status(404).json({error: "Resident not found!"});
        }

        if(!destination){
            return res.status(404).json({error: "Destination not found!"});
        }

        if(count >= destination.capacity){
            return res.status(400).json({error: "House is full!"});
        }

        // use findOneAndUpdate for atomic operation
        const updated = await Resident.findOneAndUpdate(
            { _id: req.params.id, user: req.user, dead: false },
            { $set: { house: houseId } },
            { new: true }
        );
        
        res.json({ resident: updated });
    }catch (err){
        res.status(500).json({error: err.message});
    }
});

export default router; 