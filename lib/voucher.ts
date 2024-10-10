import { z } from "zod";
import { VoucherEnv, VoucherTypologies, getVocherEnvBy } from "./voucher.env";
import { voucherGenerator } from "./voucherGenerator";

const SessionVouchers = z.record(VoucherTypologies, z.string());
type SessionVouchers = z.infer<typeof SessionVouchers>;

let cachedVouchers: SessionVouchers | undefined;

export const getVoucherApi = async (
  partialVoucherEnv: Partial<VoucherEnv> = {},
  generateExpiredToken: boolean = false
): Promise<string> => {
  const voucherEnv = {
    ...getVocherEnvBy(),
    ...partialVoucherEnv,
  };
  return await getVoucherSelfSigned(voucherEnv, generateExpiredToken);
};

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

export const getExpiredVoucher = async (
  voucherType: VoucherTypologies
): Promise<string> => await buildVoucher(voucherType, {}, true);

const buildCachedVouchers = async () => {
  const vouchers = {} as SessionVouchers;
  for (const vType of VoucherTypologies.options) {
    vouchers[vType] = await getVoucherSelfSigned(getVocherEnvBy());
  }
  cachedVouchers = SessionVouchers.parse(vouchers);
};

const buildVoucher = async (
  voucherType: VoucherTypologies,
  partialVoucherEnv: Partial<VoucherEnv>,
  generateExpiredToken: boolean = false
) => {
  const voucherEnv = {
    ...getVocherEnvBy(),
    ...partialVoucherEnv,
  };
  return await getVoucherSelfSigned(voucherEnv, generateExpiredToken);
};

const getVoucherSelfSigned = async (
  voucherEnv: VoucherEnv,
  generateExpiredToken: boolean = false
): Promise<string> => {
  try {
    return await voucherGenerator(voucherEnv).buildSelfSignedVoucher(
      generateExpiredToken
    );
  } catch (err) {
    console.log(err);
    throw new Error("no voucher");
  }
};
