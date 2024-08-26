import dotenv from "dotenv";
import { z } from "zod";

export const nodeEnv = process.env.NODE_ENV || "personal";
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
    dbPasswordAgreement: c.DB_AGREEMENT_PASSWORD,
    dbUserEservice: c.DB_ESERVICE_USER,
    dbPasswordEservice: c.DB_ESERVICE_PASSWORD,
    dbUserPurpose: c.DB_PURPOSE_USER,
    dbPasswordPurpose: c.DB_PURPOSE_PASSWORD,
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
