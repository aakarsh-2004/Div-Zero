# DIV/ZERO

A minimal competitive programming platform. Submit C++ code, get a verdict. No bloat.

---

## Stack

- **Backend** — Bun, Prisma (PostgreSQL)
- **Frontend** — React + Vite, Tailwind CSS, Monaco Editor, React Router

---

## Structure

```
DivZero/
├── api/        # Bun HTTP server
└── client/     # React frontend
```

---

## Running it locally

**1. Database**

Set up a PostgreSQL database and add a `.env` file inside `api/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/divzero"
JWT_SECRET="something-secret"
FRONTEND_URL="http://localhost:5173"
```

Run migrations:

```bash
cd api
bunx prisma migrate dev
```

**2. API**

```bash
cd api
bun install
bun run index.ts
```

Runs on `http://localhost:3000`.

**3. Client**

```bash
cd client
npm install
npm run dev
```

Runs on `http://localhost:5173`.

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/signup` | — | Register |
| POST | `/api/signin` | — | Login, returns JWT |
| GET | `/api/view-problems` | User | List all problems |
| GET | `/api/view-tests?problemId=` | User | Get tests for a problem |
| POST | `/api/submit-code` | User | Compile and judge C++ code |
| POST | `/api/create-problem` | Admin | Create a problem |
| POST | `/api/create-test` | Admin | Add a test case |
| GET | `/api/view-users` | Admin | List users |

Auth is a JWT passed as the `Authorization` header (no `Bearer` prefix).

---

## How judging works

The submitted code is written to `api/c++/main.cpp`, compiled with `g++`, then run against each test case by piping the input through stdin and comparing stdout to the expected output. Verdict is one of: **Accepted**, **Wrong Answer**, **Compilation Error**, or **Runtime Error**.

You need `g++` installed and accessible on the system PATH for submissions to work.

---

## Roles

Accounts are `USER` by default. To make an account an admin, update the `role` column in the database directly:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE username = 'yourname';
```

Admins get access to the `/admin` dashboard to create problems and test cases.
