import { z } from "zod";
import dotenv from "dotenv";
import { nodeEnv } from "../configs/env";

const Env = z.object({
  ALG: z.string(),
  TYP: z.string(),
  KEY_ID: z.string(),
  SUBJECT: z.string(),
  ISSUER: z.string(),
  AUDIENCE: z.string(),
  PURPOSE_ID: z.string(),
  PRIVATE_KEY: z.string(),
  CLIENT_ID: z.string(),
  GRANT_TYPE: z.string(),
  ASSERTION_TYPE: z.string(),
  SESSION_DURATION_IN_SECONDS: z.coerce.number(),
});

export type VoucherEnv = z.infer<typeof Env>;

const voucherTypologies = ["PRODUCER", "CONSUMER"] as const;
export type VoucherTypologies = (typeof voucherTypologies)[number];

export const voucherList: Record<VoucherTypologies, VoucherEnv> = {
  PRODUCER: buildEnv("PRODUCER"),
  CONSUMER: buildEnv("CONSUMER"),
};

function buildEnv(voucherType: VoucherTypologies): VoucherEnv {
  const voucherConfigData = {};
  const path = `.env.${nodeEnv}.voucher.${voucherType.toLowerCase()}`;
  dotenv.config({
    path,
    processEnv: voucherConfigData,
    override: true,
  });
  const parsedVoucherEnv = Env.safeParse(voucherConfigData);
  if (!parsedVoucherEnv.success) {
    const invalidEnvVars = parsedVoucherEnv.error.issues.flatMap(
      (issue) => issue.path
    );
    console.error("Invalid or missing env vars: " + invalidEnvVars.join(", "));
    process.exit(1);
  }
  return parsedVoucherEnv.data;
}
