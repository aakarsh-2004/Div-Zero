import type { BunRequest } from "bun";
import type { CreateTestSchema } from "../types/types";
import { prisma } from "../prisma/db";

export const createTest = async (req: BunRequest) => {
    const body = await req.json() as CreateTestSchema;

    if(!body.problemId || !body.input || !body.correctOutput) {
        return Response.json({
            message: "Missing required fields"
        }, { status: 400 });
    }

    try {
        const res = await prisma.test.create({
            data: {
                problemId: body.problemId,
                input: body.input,
                correctOutput: body.correctOutput
            }
        });

        return Response.json({
            status: 'ok',
            res
        }, { status: 201 });
    } catch (error) {
        return Response.json({
            message: "Error while creating the test",
            error
        });
    }
};