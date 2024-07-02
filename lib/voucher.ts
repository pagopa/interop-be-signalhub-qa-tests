import { z } from "zod";
import { VoucherEnv, VoucherTypologies, getVocherEnvBy } from "./voucher.env";
import { voucherGenerator } from "./voucherGenerator";

const SessionVouchers = z.record(VoucherTypologies, z.string());
type SessionVouchers = z.infer<typeof SessionVouchers>;

let cachedVouchers: SessionVouchers | undefined;

export const getVoucherBy = async (
  voucherType: VoucherTypologies,
  partialVoucherEnv: Partial<VoucherEnv> = {}
): Promise<string> => {
  if (Object.keys(partialVoucherEnv).length !== 0) {
    return await buildVoucher(voucherType, partialVoucherEnv);
  }
  if (!cachedVouchers) {
    await buildCachedVouchers();
  }
  const voucher = cachedVouchers![voucherType];

  if (!voucher) {
    throw new Error(`Voucher not found for voucherType: ${voucherType}`);
  }
  return voucher;
};

const buildCachedVouchers = async () => {
  const vouchers = {} as SessionVouchers;
  for (const vType of VoucherTypologies.options) {
    vouchers[vType] = await getVoucherSelfSigned(getVocherEnvBy(vType));
  }
  cachedVouchers = SessionVouchers.parse(vouchers);
};

const buildVoucher = async (
  voucherType: VoucherTypologies,
  partialVoucherEnv: Partial<VoucherEnv>
) => {
  const voucherEnv = {
    ...getVocherEnvBy(voucherType),
    ...partialVoucherEnv,
  };
  return await getVoucherSelfSigned(voucherEnv);
};

const getVoucherSelfSigned = async (
  voucherEnv: VoucherEnv
): Promise<string> => {
  try {
    return await voucherGenerator(voucherEnv).buildSelfSignedVoucher();
  } catch (err) {
    console.log(err);
    throw new Error("no voucher");
  }
};
