import type { BunRequest } from "bun";
import { $ } from "bun";
import type { SubmitCodeBody, Test } from "../types/types";
import { prisma } from "../prisma/db";
import { authenticateUser } from "../middlewares/authenticateUser";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";

const DOCKER_IMAGE = "frolvlad/alpine-gxx";
const EXECUTION_TIMEOUT_MS = 10_000;

export const submitCode = async (req: BunRequest) => {
  const isAuthenticated = await authenticateUser(req);
  if (!isAuthenticated) {
    return Response.json(
      { message: "User not identified" },
      { status: 404 },
    );
  }

  const body = (await req.json()) as SubmitCodeBody;

  if (!body.code || !body.problemId || !body.userId) {
    return Response.json(
      { message: "Missing required parameters" },
      { status: 400 },
    );
  }

  const submissionId = crypto.randomUUID();
  const workDir = path.join(os.tmpdir(), `divzero_${submissionId}`);

  try {
    fs.mkdirSync(workDir, { recursive: true });
    await Bun.write(path.join(workDir, "main.cpp"), body.code);

    const tests: Test[] = await prisma.test.findMany({
      where: { problemId: body.problemId },
    });

    const compile =
      await $`docker run --rm -v ${workDir}:/code ${DOCKER_IMAGE} g++ /code/main.cpp -o /code/main`.quiet();

    if (compile.exitCode !== 0) {
      return Response.json({
        message: "Compilation Error",
        errorDetails: compile.stderr.toString(),
      });
    }

    for (const test of tests) {
      let timedOut = false;

      const runResult = Bun.spawn(
        [
          "docker", "run",
          "--rm",          // remove container after exit
          "-i",            // keep stdin open
          "--network", "none",      // no network access
          "--memory", "256m",       // memory cap
          "--cpus", "0.5",          // CPU cap
          "-v", `${workDir}:/code`,
          DOCKER_IMAGE,
          "/code/main",
        ],
        {
          stdin: new TextEncoder().encode(test.input),
          stdout: "pipe",
          stderr: "pipe",
        },
      );

      const timer = setTimeout(() => {
        timedOut = true;
        runResult.kill();
      }, EXECUTION_TIMEOUT_MS);

      await runResult.exited;
      clearTimeout(timer);

      if (timedOut) {
        return Response.json({
          message: `Time Limit Exceeded on test ${test.id}`,
        });
      }

      if (runResult.exitCode !== 0) {
        return Response.json({
          message: `Runtime Error on test ${test.id}`,
          exitCode: runResult.exitCode,
        });
      }

      const cleanUserOutput = (await new Response(runResult.stdout).text()).trim();
      const cleanExpectedOutput = test.correctOutput.trim();

      if (cleanUserOutput !== cleanExpectedOutput) {
        return Response.json({
          message: `Failed on test ${test.id} (Wrong Answer)`,
          input: test.input,
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
  } finally {
    // Always clean up the temp directory
    try {
      fs.rmSync(workDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
};
