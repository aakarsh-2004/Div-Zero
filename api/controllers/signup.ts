import { type BunRequest } from "bun";
import type { SignupSchema } from "../types/types";
import { prisma } from "../prisma/db";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from "../config/config";

export const signup = async (req: BunRequest) => {
    const body = await req.json() as SignupSchema;

    if(!body.name || !body.username || !body.password) {
        return Response.json({
            error: "Invalid request body"
        }, { status: 400 });
    }

    try {
        const hashedPassword = await bcrypt.hash(body.password, 10);
        const res = await prisma.user.create({
            data: {
                username: body.username,
                password: hashedPassword,
                name: body.name
            }
        });

        const token = jwt.sign({
            username: res.username,
            id: res.id,
            name: res.name
        }, config.jwtSecret, {
            expiresIn: '7d'
        });

        return Response.json({
            status: "ok",
            token
        }, { status: 201 });
    } catch (error) {
        return Response.json({
            "message": "Error while creating the user",
            error
        });
    }
}