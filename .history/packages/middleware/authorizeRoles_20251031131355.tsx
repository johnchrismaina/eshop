import { NextFunction, Response } from "express";

export const isSeller = (req:any,res:Response,next:NextFunction) => {
    if(req.role !== "seller"){
        return next(new AuthError())
    }
}