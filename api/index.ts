import { config } from "./config/config";
import { createProblem } from "./controllers/createProblem";
import { createTest } from "./controllers/createTest";
import { getProblems } from "./controllers/getProblems";
import { getTests } from "./controllers/getTests";
import { getUser } from "./controllers/getUser";
import { signin } from "./controllers/signin";
import { signup } from "./controllers/signup";
import { submitCode } from "./controllers/submitCode";
import { getSubmissions } from "./controllers/getSubmissions";
import { withCors, preflight } from "./middlewares/cors";

const server = Bun.serve({
    port: config.port,
    routes: {
        "/api/health": {
            GET: () => withCors(Response.json({ status: 'healthy' })),
            OPTIONS: () => preflight(),
        },
        "/api/signup": {
            POST: async (req) => withCors(await signup(req)),
            OPTIONS: () => preflight(),
        },
        "/api/signin": {
            POST: async (req) => withCors(await signin(req)),
            OPTIONS: () => preflight(),
        },
        "/api/create-problem": {
            POST: async (req) => withCors(await createProblem(req)),
            OPTIONS: () => preflight(),
        },
        "/api/create-test": {
            POST: async (req) => withCors(await createTest(req)),
            OPTIONS: () => preflight(),
        },
        "/api/submit-code": {
            POST: async (req) => withCors(await submitCode(req)),
            OPTIONS: () => preflight(),
        },
        "/api/view-users": {
            GET: async (req) => withCors(await getUser(req)),
            OPTIONS: () => preflight(),
        },
        "/api/view-problems": {
            GET: async (req) => withCors(await getProblems(req)),
            OPTIONS: () => preflight(),
        },
        "/api/view-tests": {
            GET: async (req) => withCors(await getTests(req)),
            OPTIONS: () => preflight(),
        },
        "/api/view-submissions": {
            GET: async (req) => withCors(await getSubmissions(req)),
            OPTIONS: () => preflight(),
        },
    },
    fetch(req) {
        if (req.method === "OPTIONS") return preflight();
        return withCors(new Response("404 Not Found!", { status: 404 }));
    }
});

console.log(`${new Date()} : Listening on ${server.port}`);