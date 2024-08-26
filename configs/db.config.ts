import dotenv from "dotenv";
import { z } from "zod";

export const nodeEnv = process.env.NODE_ENV || "personal";
dotenv.config({ path: `.env.${nodeEnv}.local` });

const databaseEnvConfig = z
  .object({
    DB_NAME: z.string(),
    DB_HOST: z.string(),
    DB_PORT: z.coerce.number(),
    DB_USER_BATCH_UPDATE: z.string(),
    DB_PASSWORD_BATCH_UPDATE: z.string(),
    DB_USER_BATCH_CLEANUP: z.string(),
    DB_PASSWORD_BATCH_CLEANUP: z.string(),
    DB_USE_SSL: z
      .enum(["true", "false"])
      .transform((value) => value === "true"),
  })
  .transform((c) => ({
    dbName: c.DB_NAME,
    dbHost: c.DB_HOST,
    dbPort: c.DB_PORT,
    dbUserBatchUpdate: c.DB_USER_BATCH_UPDATE,
    dbPasswordBatchUpdate: c.DB_PASSWORD_BATCH_UPDATE,
    dbUserBatchCleanup: c.DB_USER_BATCH_CLEANUP,
    dbPasswordBatchCleanup: c.DB_PASSWORD_BATCH_CLEANUP,
    dbUseSSL: c.DB_USE_SSL,
  }));

export type DatabaseEnvConfig = z.infer<typeof databaseEnvConfig>;

const parsedDbEnv = databaseEnvConfig.safeParse(process.env);

if (!parsedDbEnv.success) {
  const invalidEnvVars = parsedDbEnv.error.issues.flatMap(
    (issue) => issue.path
  );
  console.error("Invalid or missing env DB vars: " + invalidEnvVars.join(", "));
  process.exit(1);
}

export const databaseConfig: DatabaseEnvConfig = {
  ...parsedDbEnv.data,
};
