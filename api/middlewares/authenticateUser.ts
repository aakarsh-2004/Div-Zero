import type { BunRequest } from "bun";
import { prisma } from "../prisma/db"
import jwt from 'jsonwebtoken'
import { config } from "../config/config";
import type { TokenSchema } from "../types/types";

export const authenticateUser = async (req: BunRequest) => {
    const token = req.headers.get("Authorization")!;
    const decoded = jwt.verify(token, config.jwtSecret) as TokenSchema;

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
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