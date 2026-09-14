import dotenv from "dotenv";
import { z } from "zod";

import { nodeEnv } from "../configs/env";

const Env = z.object({
  ALG: z.string(),
  ASSERTION_TYPE: z.string(),
  AUDIENCE: z.string(),
  CLIENT_ID: z.string(),
  GRANT_TYPE: z.string(),
  ISSUER: z.string(),
  KEY_ID: z.string(),
  KMS_KEY_ID: z.string(),
  ORGANIZATION_ID: z.string(),
  SESSION_DURATION_IN_SECONDS: z.coerce.number(),
  SUBJECT: z.string(),
  TYP: z.string(),
});

export type VoucherEnv = z.infer<typeof Env>;

export function getVocherEnv(): VoucherEnv {
  const voucherConfigData = {};
  const path = `.env.${nodeEnv}.voucher`;

  dotenv.config({
    override: true,
    path,
    processEnv: voucherConfigData,
  });
  const parsedVoucherEnv = Env.safeParse(voucherConfigData);
  if (!parsedVoucherEnv.success) {
    const invalidEnvVars = parsedVoucherEnv.error.issues.flatMap(
      (issue) => issue.path,
    );
    console.error(
      "Invalid or missing env vars (voucher creation): " +
        invalidEnvVars.join(", "),
    );
    process.exit(1);
  }

  return parsedVoucherEnv.data;
}
