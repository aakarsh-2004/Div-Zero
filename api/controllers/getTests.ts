import type { BunRequest } from "bun";
import { prisma } from "../prisma/db";

interface GetTest {
    problemId: string;
}

export const getTests = async (req: BunRequest) => {
    const { searchParams } = new URL(req.url);
    const problemId = searchParams.get("problemId");

    if(!problemId) {
        return Response.json({
            message: "Missing problem Id"
        }, { status: 404 });
    }

    try {
        const tests = await prisma.test.findMany({
            where: {
                problemId: problemId
            }
        });

        return Response.json(tests, { status: 200 });
    } catch (error) {
        return Response.json({
            message: "Error while getting tests"
        }, { status: 500 });
    }
}