import dotenv from "dotenv";
import { z } from "zod";
import { nodeEnv } from "../configs/env";

dotenv.config({ path: `.env.${nodeEnv}.local` });

const databaseEnvConfig = z
  .object({
    DB_NAME: z.string(),
    DB_HOST: z.string(),
    DB_PORT: z.coerce.number(),
    DB_AGREEMENT_USER: z.string(),
    DB_AGREEMENT_PASSWORD: z.string(),
    DB_ESERVICE_USER: z.string(),
    DB_ESERVICE_PASSWORD: z.string(),
    DB_PURPOSE_USER: z.string(),
    DB_PURPOSE_PASSWORD: z.string(),
    DB_DELEGATION_USER: z.string(),
    DB_DELEGATION_PASSWORD: z.string(),
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
    dbUserAgreement: c.DB_AGREEMENT_USER,
    dbPasswordAgreement: encodeURIComponent(c.DB_AGREEMENT_PASSWORD),
    dbUserEservice: c.DB_ESERVICE_USER,
    dbPasswordEservice: encodeURIComponent(c.DB_ESERVICE_PASSWORD),
    dbUserPurpose: c.DB_PURPOSE_USER,
    dbPasswordPurpose: encodeURIComponent(c.DB_PURPOSE_PASSWORD),
    dbUserDelegation: c.DB_DELEGATION_USER,
    dbPasswordDelegation: encodeURIComponent(c.DB_DELEGATION_PASSWORD),
    dbUserBatchCleanup: c.DB_USER_BATCH_CLEANUP,
    dbPasswordBatchCleanup: encodeURIComponent(c.DB_PASSWORD_BATCH_CLEANUP),
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
