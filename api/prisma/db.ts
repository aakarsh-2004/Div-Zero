import { config } from "../config/config";
import { PrismaClient } from "./generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: config.dbUrl,
});

export const prisma = new PrismaClient({
  adapter,
});