import type { BunRequest } from "bun";
import type { CreateProblemSchema } from "../types/types";
import { prisma } from "../prisma/db";
import { authenticateAdmin } from "../middlewares/authenticateAdmin";

export const createProblem = async (req: BunRequest) => {
    const isAuthenticated = await authenticateAdmin(req);
    if(!isAuthenticated) {
        return Response.json({
            message: "User not identified"
        }, { status: 404 });
    }
    
    const body = await req.json() as CreateProblemSchema;

    if(!body.title || !body.description) {
        return Response.json({
            message: "Missing required fields"
        }, { status: 400 });
    }

    try {
        const response = await prisma.problem.create({
            data: {
                title: body.title,
                description: body.description
            }
        });

        return Response.json({
            status: 'ok',
            response
        }, { status: 201 });
    } catch (error) {
        return Response.json({
            message: "Error while creating the problem",
            error
        }, { status: 400 });
    }
};