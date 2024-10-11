import { VoucherEnv, getVocherEnv } from "./voucher.env";
import { voucherGenerator } from "./voucherGenerator";

let cachedVouchers: string | undefined;

export const getVoucherApi = async (
  partialVoucherEnv: Partial<VoucherEnv> = {},
  generateExpiredToken: boolean = false
): Promise<string> => {
  const voucherEnv = {
    ...getVocherEnv(),
    ...partialVoucherEnv,
  };
  return await getVoucherSelfSigned(voucherEnv, generateExpiredToken);
};

export const getVoucher = async (
  partialVoucherEnv: Partial<VoucherEnv> = {}
): Promise<string> => {
  if (isVoucherOverWritten(partialVoucherEnv)) {
    return await buildVoucher(partialVoucherEnv);
  }
  if (!cachedVouchers) {
    await buildCachedVoucher();
  }
  const voucher = cachedVouchers!;

  if (!voucher) {
    throw new Error("Voucher not found");
  }
  return voucher;
};

export const getExpiredVoucher = async (): Promise<string> =>
  await buildVoucher({}, true);

const buildCachedVoucher = async () => {
  cachedVouchers = await getVoucherSelfSigned(getVocherEnv());
};

const isVoucherOverWritten = (
  overrideVoucher: Partial<VoucherEnv>
): boolean => {
  return Object.keys(overrideVoucher).length !== 0;
};

const buildVoucher = async (
  partialVoucherEnv: Partial<VoucherEnv>,
  generateExpiredToken: boolean = false
) => {
  const voucherEnv = {
    ...getVocherEnv(),
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
