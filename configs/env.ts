import dotenv from "dotenv";
import { TypeOf, z } from "zod";

export const nodeEnv = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${nodeEnv}` });

export const Env = z.object({
  CUCUMBER_OPTS_PARALLEL: z.coerce.number(),
  CUCUMBER_SET_DEFAULT_TIMEOUT_MS: z.coerce.number(),
  URL_AUTH_TOKEN: z.string(),
  API_BASE_URL_PUSH: z.string(),
  API_BASE_URL_PULL: z.string(),
  EXPIRED_TOKEN: z.string(),
  DB_NAME: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  CATALOG_INTEROP_DATA_PREPARATION_FILE: z.string(),
  WAIT_BEFORE_PUSHING_DUPLICATED_SIGNALID_IN_MS: z.coerce.number(),
  LEVEL_VERIFY_ERROR_HTTP_CODE: z.enum(["strict", "loose"]).default("strict"),
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
