import jwt from "jsonwebtoken"
import User from "../schemas/User.js"

// protects api routes by verifying jwt token
export const protect = async (req, res, next) => {
    try{
        // reads token from authorization header
        let token = req.headers.authorization;

        if (!token) {
            return res.status(401).json({ message: "Not authorized!" });
        }

        // extract token from bearer (removes bearer)
        if (typeof token === "string" && token.startsWith("Bearer ")) token = token.split(" ")[1];

        // verifies token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // attach user info to request
        req.user = decoded.id;
        req.userDoc = await User.findById(decoded.id).select("-password");
        next();
    }catch (err){
        res.status(401).json({message: "Invalid token!"});
    }
}