export interface SubmitCodeBody {
    code: string;
    userId: string;
    problemId: string;
}

export interface SignupSchema {
    username: string;
    name: string;
    password: string;
}

export interface SigninSchema {
    username: string;
    password: string;
}

export interface CreateProblemSchema {
    title: string;
    description: string;
    userId: string;
}

export interface CreateTestSchema {
    problemId: string;
    input: string;
    correctOutput: string;
}

export interface Test {
    id: string;
    problemId: string;
    input: string;
    correctOutput: string;
}

export interface TokenSchema {
    id: string;
    name: string;
    username: string;
}