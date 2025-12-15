import express from "express"
import Transaction from "../schemas/Transaction.js"
import User from "../schemas/User.js"
import Coinling from "../schemas/Coinling.js"
import Village from "../schemas/Village.js"
import mongoose from "mongoose"
import {protect} from "../middleware/authm.js"
import { randomPersonality, dialoguesFor } from "../utils/generateDialogue.js"
import { randomName } from "../utils/generateName.js"
import { getSprite } from "../utils/generateSprite.js"

const router = express.Router();

async function ensureCoinlingCount(userId, desiredCount){
    // convert userId string to ObjectId for proper database queries
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    const alive = await Coinling.find({user: userObjectId, dead: false}).sort({createdAt: 1}).lean();
    const aliveCount = alive.length;

    // create missing
    if(aliveCount < desiredCount){
        const need = desiredCount - aliveCount;
        
        // fetch villages once and get current counts in single aggregation query
        const villages = await Village.find({ user: userObjectId, deleted: false }).lean();
        const villageCounts = await Coinling.aggregate([
            { $match: { user: userObjectId, dead: false } },
            { $group: { _id: "$village", count: { $sum: 1 } } }
        ]);
        
        const countMap = new Map(villageCounts.map(v => [v._id.toString(), v.count]));
        
        // prepare batch of coinlings to create
        const coinlingsToCreate = [];
        let newVillages = [];
        
        for(let i = 0; i < need; i++){
            let chosen = null;
            
            // look for available villages - check ALL villages before creating new one
            for (const v of villages) {
                const currentCount = countMap.get(v._id.toString()) || 0;
                if (currentCount < v.capacity) {
                    chosen = v;
                    countMap.set(v._id.toString(), currentCount + 1);
                    break;
                }
            }

            // only create new village if ALL existing villages are at max capacity
            if (!chosen) {
                // check if we already have a pending new village with space
                const pendingVillage = newVillages.find(nv => {
                    const tempId = nv.tempId;
                    const currentCount = countMap.get(tempId) || 0;
                    return currentCount < nv.capacity;
                });
                
                if (pendingVillage) {
                    chosen = pendingVillage;
                    const tempId = pendingVillage.tempId;
                    const currentCount = countMap.get(tempId) || 0;
                    countMap.set(tempId, currentCount + 1);
                } else {
                    // create new village only when necessary
                    const leftPercent = Math.floor(Math.random() * 80) + 10; 
                    const topPercent = Math.floor(Math.random() * 80) + 10;
                    const tempId = `temp_${Date.now()}_${i}`;
                    chosen = {
                        user: userObjectId,
                        leftPercent,
                        topPercent,
                        capacity: 2,
                        name: "Village",
                        tempId // temporary id for tracking before insertion
                    };
                    newVillages.push(chosen);
                    countMap.set(tempId, 1);
                }
            }

            // prepare coinling data
            const personality = randomPersonality();
            
            // manually generate rarity and sprite (since insertMany bypasses pre-save hooks)
            const roll = Math.random();
            let rarity;
            if (roll < 0.60) rarity = "common";
            else if (roll < 0.99) rarity = "rare";
            else rarity = "legendary";
            
            coinlingsToCreate.push({
                user: userObjectId,
                village: chosen._id || chosen.tempId, // use real id or temp id
                name: randomName(),
                personality,
                dialogues: dialoguesFor(personality),
                rarity,
                sprite: getSprite(rarity),
            });
        }
        
        // bulk create new villages if needed
        if (newVillages.length > 0) {
            const created = await Village.insertMany(newVillages.map(nv => ({
                user: nv.user,
                leftPercent: nv.leftPercent,
                topPercent: nv.topPercent,
                capacity: nv.capacity,
                name: nv.name
            })));
            
            // create mapping from temp ids to real ids
            const tempIdToRealId = new Map();
            created.forEach((village, idx) => {
                tempIdToRealId.set(newVillages[idx].tempId, village._id);
            });
            
            // update village ids in coinlings
            for (let i = 0; i < coinlingsToCreate.length; i++) {
                const villageId = coinlingsToCreate[i].village;
                if (typeof villageId === 'string' && villageId.startsWith('temp_')) {
                    coinlingsToCreate[i].village = tempIdToRealId.get(villageId);
                }
            }
        }
        
        // bulk create all coinlings at once
        if (coinlingsToCreate.length > 0) {
            await Coinling.insertMany(coinlingsToCreate);
        }

        return;
    }

    // mark dead using bulk update
    if(aliveCount > desiredCount){
        const remove = aliveCount - desiredCount;
        const toKill = alive.slice(0, remove);
        const idsToKill = toKill.map(g => g._id);

        await Coinling.updateMany(
            { _id: { $in: idsToKill } },
            { $set: { dead: true } }
        );

        return;
    }
}

// get all transactions of current user
router.get("/", protect, async (req, res) => {
    try{
        const transactions = await Transaction.find({user: req.user}).sort({createdAt: -1});
        res.json(transactions);
    }catch (err){
        res.status(500).json({message: err.message});
    }
});

// record new transaction
router.post("/", protect, async(req, res) => {
    const {type, amount, date, notes, worthIt} = req.body;

    if(!type || typeof amount !== "number"){
        return res.status(400).json({message: "Missing type or amount!"});
    }

    try{
        // create transaction
        const transaction = await Transaction.create({
            user: req.user,
            type, 
            amount,
            date,
            notes, 
            worthIt,
        });

        // update the balance
        const userDoc = await User.findById(req.user);
        userDoc.balance = type === "add" 
            ? userDoc.balance + amount
            : userDoc.balance - amount;
        await userDoc.save();

        // update amount of coinlings
        const desiredCount = Math.max(0, Math.floor(userDoc.balance / 1000));
        await ensureCoinlingCount(req.user, desiredCount);

        // record all dead coinlings
        const dead = await Coinling.find({
            user: req.user,
            dead: true,
            // get all coinlings marked dead in last second
            updatedAt: {$gte: new Date(Date.now() - 1000)}
        }).select('name sprite rarity');

        // record all new coinlings
        const birthed = await Coinling.find({
            user: req.user,
            dead: false,
            // get all coinlings created in last second
            updatedAt: { $gte: new Date(Date.now() - 1000) }
        }).select('name sprite rarity');

        res.json({
            transaction,
            balance: userDoc.balance,
            dead: dead || [],
            birthed: birthed || []
        });
    }catch (err){
        res.status(500).json({message: err.message});
    }
});

export default router;