import type { BunRequest } from "bun";
import { $ } from "bun";
import type { SubmitCodeBody, Test } from "../types/types";
import { prisma } from "../prisma/db";
import { authenticateUser } from "../middlewares/authenticateUser";

export const submitCode = async (req: BunRequest) => {
  const isAuthenticated = await authenticateUser(req);
  if (!isAuthenticated) {
    return Response.json(
      {
        message: "User not identified",
      },
      { status: 404 },
    );
  }

  const body = (await req.json()) as SubmitCodeBody;

  if (!body.code || !body.problemId || !body.userId) {
    return Response.json(
      {
        message: "Missing required parameters",
      },
      { status: 400 },
    );
  }

  try {
    await Bun.write("./c++/main.cpp", body.code);

    const tests: Test[] = await prisma.test.findMany({
      where: {
        problemId: body.problemId,
      },
    });

    const compile = await $`g++ ./c++/main.cpp -o ./c++/main`.quiet();

    if (compile.exitCode !== 0) {
      return Response.json({
        message: "Compilation Error",
        errorDetails: compile.stderr.toString(),
      });
    }

    for (const test of tests) {
      const runResult = Bun.spawn(["./c++/main"], {
        stdin: new TextEncoder().encode(test.input),
        stdout: "pipe",
        stderr: "pipe",
      });

      await runResult.exited;

      if (runResult.exitCode !== 0) {
        return Response.json({
          message: `Runtime Error on test ${test.id}`,
          exitCode: runResult.exitCode,
        });
      }

      const cleanUserOutput = (await new Response(runResult.stdout).text()).trim();
      const cleanExpectedOutput = test.correctOutput.trim();

      // Wrong Answer (WA)
      if (cleanUserOutput !== cleanExpectedOutput) {
        return Response.json({
          message: `Failed on test ${test.id} (Wrong Answer)`,
          "input": test.input,
          correctOutput: cleanExpectedOutput,
          userOutput: cleanUserOutput,
        });
      }
    }

    return Response.json({
      message: "Accepted",
      status: "All tests passed!",
    });
  } catch (error) {
    return Response.json({
      message: "Error while submitting code",
      error,
    });
  }
};
