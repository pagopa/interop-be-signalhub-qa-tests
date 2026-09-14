import dotenv from "dotenv";
import { z } from "zod";

import { nodeEnv } from "../configs/env";

dotenv.config({ path: `.env.${nodeEnv}.local` });

const databaseEnvConfig = z
  .object({
    DB_AGREEMENT_PASSWORD: z.string(),
    DB_AGREEMENT_USER: z.string(),
    DB_DELEGATION_PASSWORD: z.string(),
    DB_DELEGATION_USER: z.string(),
    DB_ESERVICE_PASSWORD: z.string(),
    DB_ESERVICE_USER: z.string(),
    DB_HOST: z.string(),
    DB_NAME: z.string(),
    DB_PASSWORD_BATCH_CLEANUP: z.string(),
    DB_PORT: z.coerce.number(),
    DB_PURPOSE_PASSWORD: z.string(),
    DB_PURPOSE_USER: z.string(),
    DB_USE_SSL: z
      .enum(["true", "false"])
      .transform((value) => value === "true"),
    DB_USER_BATCH_CLEANUP: z.string(),
  })
  .transform((c) => ({
    dbHost: c.DB_HOST,
    dbName: c.DB_NAME,
    dbPasswordAgreement: encodeURIComponent(c.DB_AGREEMENT_PASSWORD),
    dbPasswordBatchCleanup: encodeURIComponent(c.DB_PASSWORD_BATCH_CLEANUP),
    dbPasswordDelegation: encodeURIComponent(c.DB_DELEGATION_PASSWORD),
    dbPasswordEservice: encodeURIComponent(c.DB_ESERVICE_PASSWORD),
    dbPasswordPurpose: encodeURIComponent(c.DB_PURPOSE_PASSWORD),
    dbPort: c.DB_PORT,
    dbUserAgreement: c.DB_AGREEMENT_USER,
    dbUserBatchCleanup: c.DB_USER_BATCH_CLEANUP,
    dbUserDelegation: c.DB_DELEGATION_USER,
    dbUserEservice: c.DB_ESERVICE_USER,
    dbUserPurpose: c.DB_PURPOSE_USER,
    dbUseSSL: c.DB_USE_SSL,
  }));

export type DatabaseEnvConfig = z.infer<typeof databaseEnvConfig>;

const parsedDbEnv = databaseEnvConfig.safeParse(process.env);

if (!parsedDbEnv.success) {
  const invalidEnvVars = parsedDbEnv.error.issues.flatMap(
    (issue) => issue.path,
  );
  console.error("Invalid or missing env DB vars: " + invalidEnvVars.join(", "));
  process.exit(1);
}

export const databaseConfig: DatabaseEnvConfig = {
  ...parsedDbEnv.data,
};
