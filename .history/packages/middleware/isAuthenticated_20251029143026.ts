import { Response, NextFunction } from "express";


const isAuthenticated = async (req:any, res:Response, next:NextFunction) => {
    try {
        const token = 
        req.cookies.access_token || req.headers.authorization?.split(" ")[1];

        if(!token) {
            return res.status(401).json({message:""})
        }

    } catch (error) {
        
    }
}