import type { BunRequest } from "bun";
import { prisma } from "../prisma/db"
import jwt from 'jsonwebtoken';
import { config } from "../config/config";
import type { TokenSchema } from "../types/types";

export const authenticateAdmin = async (req: BunRequest) => {
    const token = req.headers.get("Authorization");
    
    if(!token) {
        return false;
    }
    try {
        const userData = jwt.verify(token, config.jwtSecret) as TokenSchema;
        
        const user = await prisma.user.findUnique({
            where: {
                id: userData.id,
                role: 'ADMIN'
            }
        });
        
        if(!user) {
            return false;
        }
        
        return true;
    } catch (error) {
        return false;
    }
};