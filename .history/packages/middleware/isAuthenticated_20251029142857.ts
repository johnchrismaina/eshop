import { Response, NextFunction } from "express";


const isAuthenticated = async (re:any, res:Response, next:NextFunction) => {
    try {
        const token = 
        require.cookies.access_token || require.headers.authorization?.split(" ")[1];

    } catch (error) {
        
    }
}