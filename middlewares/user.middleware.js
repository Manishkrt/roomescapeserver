import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
const secretKey = process.env.JWT_SECRET_KEY


export const userAuth = (req, res, next)=>{
    const token = req.headers['authorization']; 
    if(!token){
        return res.status(401).json({message: 'Unauthenticated'})
    }
    try{
        const user = jwt.verify(token, secretKey); 
        if(user.isBlocked === true){
            return res.status(403).json({message: 'Your account is blocked. Please contact support Team.'})
        }
        req.user = user;
        next();
    }catch(err){ 
        res.status(401).json({message: err.message})
    }
} 

export const userLoginMiddleware = (req, res, next)=>{
    const {email, password} = req.body
    if (!email && !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }
    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }
    if (!password) {
        return res.status(400).json({ message: 'Password is required.' });
    }
    next()
}

