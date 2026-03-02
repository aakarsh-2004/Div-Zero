import type { BunRequest } from "bun";
import { prisma } from "../prisma/db";

export const getProblems = async (req: BunRequest) => {
    try {
        const problems = await prisma.problem.findMany();

        return Response.json(problems, { status: 200 });
    } catch (error) {
        return Response.json({
            message: "Error while finding problems"
        }, { status: 500 });
    }
}