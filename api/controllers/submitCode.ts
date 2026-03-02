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
      await $`sudo docker run --rm -v ${workDir}:/code:z ${DOCKER_IMAGE} sh -c "g++ /code/main.cpp -o /code/main && chmod +x /code/main"`.quiet();

    if (compile.exitCode !== 0) {
      return Response.json({
        message: "Compilation Error",
        errorDetails: compile.stderr.toString(),
      });
    }

    for (let i = 0; i < tests.length; i++) {
      await Bun.write(path.join(workDir, `input_${i}.txt`), tests[i].input);
    }

    const timeoutSecs = Math.floor(EXECUTION_TIMEOUT_MS / 1000);
    const shellScript = tests
      .map(
        (_, i) =>
          `timeout ${timeoutSecs}s /code/main < /code/input_${i}.txt > /code/output_${i}.txt 2>/code/stderr_${i}.txt; echo $? > /code/exit_${i}.txt`,
      )
      .join("; ");

    await $`sudo docker run --rm -i --network none --memory 256m --cpus 0.5 -v ${workDir}:/code:z ${DOCKER_IMAGE} sh -c ${shellScript}`.quiet();

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      const exitCode = parseInt(
        (await Bun.file(path.join(workDir, `exit_${i}.txt`)).text()).trim(),
        10,
      );

      if (exitCode === 124) {
        return Response.json({
          message: `Time Limit Exceeded on test ${test.id}`,
        });
      }

      if (exitCode !== 0) {
        const stderr = (await Bun.file(path.join(workDir, `stderr_${i}.txt`)).text()).trim();
        return Response.json({
          message: `Runtime Error on test ${test.id}`,
          exitCode,
          stderr,
        });
      }

      const cleanUserOutput = (
        await Bun.file(path.join(workDir, `output_${i}.txt`)).text()
      ).trim();
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
    console.log("Error during code submission:", error);
    return Response.json({
      message: "Error while submitting code",
      error,
    });
  } finally {
    try {
      fs.rmSync(workDir, { recursive: true, force: true });
    } catch {

    }
  }
};
