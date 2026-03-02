import type { BunRequest } from "bun";
import type { SigninSchema } from "../types/types";
import bcrypt from 'bcrypt';
import { prisma } from "../prisma/db";
import jwt from 'jsonwebtoken';
import { config } from "../config/config";

export const signin = async (req: BunRequest) => {
    const body = await req.json() as SigninSchema;

    if(!body.username || !body.password) {
        return Response.json({
            message: "Invalid request body",
        }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                username: body.username
            }
        });
        if(!user) {
            return Response.json({
                message: "User does not exists"
            }, { status: 404 });
        }

        const compare = await bcrypt.compare(body.password, user.password);
        if(compare) {
            const token = jwt.sign({
                username: user.username,
                id: user.id,
                name: user.name
            }, config.jwtSecret, {
                expiresIn: '7d'
            });

            return Response.json({
                status: 'success',
                token
            }, { status: 200 });
        }
        else {
            return Response.json({
                message: "Invalid password!"
            });
        }
    } catch (error) {
        return Response.json({
            message: "There was an error signing in!",
            error
        });
    }
}