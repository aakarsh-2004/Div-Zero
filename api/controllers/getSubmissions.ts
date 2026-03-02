import type { BunRequest } from "bun";
import { prisma } from "../prisma/db";
import { authenticateUser } from "../middlewares/authenticateUser";

export const getSubmissions = async (req: BunRequest) => {
  const isAuthenticated = await authenticateUser(req);
  if (!isAuthenticated) {
    return Response.json({ message: "User not identified" }, { status: 401 });
  }

  const url = new URL(req.url);
  const problemId = url.searchParams.get("problemId");
  const userId = url.searchParams.get("userId");

  if (!problemId || !userId) {
    return Response.json({ message: "Missing problemId or userId" }, { status: 400 });
  }

  const submissions = await prisma.submission.findMany({
    where: { problemId, userId },
    orderBy: { time: "desc" },
    select: { id: true, verdict: true, time: true },
  });

  return Response.json(submissions);
};
