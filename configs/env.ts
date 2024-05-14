import dotenv from "dotenv";
import { TypeOf, z } from "zod";

const nodeEnv = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${nodeEnv}` });

export const Env = z.object({
  CUCUMBER_OPTS_PARALLEL: z.coerce.number(),
  URL_AUTH_TOKEN: z.string(),
  SESSION_DURATION_IN_SECONDS: z.coerce.number(),
  API_BASE_PATH: z.string(),
  PUSH_SERVICE_PORT: z.string(),
  PULL_SERVICE_PORT: z.string(),
  FAKE_PURPOSE_ID: z.string(),
  EXPIRED_TOKEN: z.string(),
  // Db string connections
  DB_NAME: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  CATALOG_INTEROP_DATA_PREPARATION_FILE: z.string(),
  WAIT_BEFORE_PUSHING_DUPLICATED_SIGNALID_IN_MS: z.coerce.number(),
});

const parsedEnv = Env.safeParse(process.env);

if (!parsedEnv.success) {
  const invalidEnvVars = parsedEnv.error.issues.flatMap((issue) => issue.path);
  console.error("Invalid or missing env vars: " + invalidEnvVars.join(", "));
  process.exit(1);
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends TypeOf<typeof Env> {}
  }
}
