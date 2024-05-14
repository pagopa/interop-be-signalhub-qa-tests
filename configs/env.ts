import dotenv from "dotenv";
import { TypeOf, z } from "zod";

const nodeEnv = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${nodeEnv}` });

export const Env = z.object({
  CUCUMBER_OPTS_PARALLEL: z.coerce.number(),
  KEY_ID: z.string(),
  SUBJECT: z.string(),
  ISSUER: z.string(),
  AUDIENCE: z.string(),
  PURPOSE_ID: z.string(),
  SH_PUSH_PRIVATE_KEY: z.string(),
  URL_AUTH_TOKEN: z.string(),
  CLIENT_ID: z.string(),
  GRANT_TYPE: z.string(),
  ASSERTION_TYPE: z.string(),
  SESSION_DURATION_IN_SECONDS: z.coerce.number(),
  API_BASE_PATH: z.string(),
  PUSH_SERVICE_PORT: z.string(),
  PULL_SERVICE_PORT: z.string(),
  FAKE_PURPOSE_ID: z.string(),
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
