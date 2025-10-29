import { Response, NextFunction } from "express";


const isAuthenticated = async (req:any, res:Response, next:NextFunction) => {
    try {
        const token = 
        req.cookies.access_token || require.headers.authorization?.split(" ")[1];

    } catch (error) {
        
    }
}