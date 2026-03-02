import type { BunRequest } from "bun";
import { authenticateAdmin } from "../middlewares/authenticateAdmin";
import { prisma } from "../prisma/db";

export const getUser = async (req: BunRequest) => {
    const isAuthenticated = await authenticateAdmin(req);
    if(!isAuthenticated) {
        return Response.json({
            message: "User not identified"
        }, { status: 404 });
    }

    try {
        const users = await prisma.user.findMany();

        return Response.json(users, { status: 200 });
    } catch (error) {
        return Response.json({
            message: "Error finding users"
        }, { status: 500 });
    }
}