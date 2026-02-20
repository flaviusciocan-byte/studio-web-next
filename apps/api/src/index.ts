import "dotenv/config";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { ensureStorage } from "./config/storage.js";
import { prisma } from "./config/prisma.js";

const start = async (): Promise<void> => {
  await ensureStorage();

  app.listen(env.PORT, () => {
    console.log(`zaria-builder-api listening on http://localhost:${env.PORT}`);
  });
};

start().catch(async (error: unknown) => {
  console.error("Failed to boot server", error);
  await prisma.$disconnect();
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
