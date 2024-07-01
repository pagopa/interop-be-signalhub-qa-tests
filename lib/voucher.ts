import { v4 as uuidv4 } from "uuid";
import { importPKCS8, SignJWT } from "jose";
import { z } from "zod";
import { VoucherEnv, VoucherTypologies, getVoucherDataBy } from "./voucher.env";
import { KMSGenVoucher, kmsGenVoucher } from "./kmsGenVoucher";

type VoucherPayload = {
  client_id: string;
  grant_type: string;
  client_assertion: string;
  client_assertion_type: string;
};
type JWTHeader = {
  alg: string;
  typ: string;
  kid: string;
};

export type JWTPayload = {
  sub: string;
  iss: string;
  aud: string;
  jti: string;
  purposeId: string;
  iat: number;
  exp: number;
};

const SessionVouchers = z.record(VoucherTypologies, z.string());
type SessionVouchers = z.infer<typeof SessionVouchers>;

let cachedVouchers: SessionVouchers | undefined;

export const getVoucherBy = async (
  voucherType: VoucherTypologies,
  partialVoucherEnv: Partial<VoucherEnv> = {}
): Promise<string> => {
  if (Object.keys(partialVoucherEnv).length !== 0) {
    return await buildSpecialVoucher(voucherType, partialVoucherEnv);
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
    // vouchers[vType] = await getVoucher(getVoucherDataBy(vType));
    vouchers[vType] = await getVoucherSelfSigned(getVoucherDataBy(vType));
  }
  cachedVouchers = SessionVouchers.parse(vouchers);
};

const buildSpecialVoucher = async (
  voucherType: VoucherTypologies,
  partialVoucherEnv: Partial<VoucherEnv>
) => {
  const voucherEnv = {
    ...getVoucherDataBy(voucherType),
    ...partialVoucherEnv,
  };
  // return await getVoucher(voucherEnv);
  return await getVoucherSelfSigned(voucherEnv);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getVoucher = async (voucherEnv: VoucherEnv): Promise<string> => {
  try {
    const jwtHeader: JWTHeader = buildJWTHeader(voucherEnv);
    const jwtPayload: JWTPayload = buildJWTPayload(voucherEnv);
    const privateKeyPem = getPrivateKey(voucherEnv);
    const clientAssertion = await generateClientAssertion(
      jwtHeader,
      jwtPayload,
      privateKeyPem
    );
    const voucherPayload: VoucherPayload = buildVoucherPayload(
      voucherEnv,
      clientAssertion
    );
    return await obtainVoucher(voucherPayload, process.env.URL_AUTH_TOKEN);
  } catch (err) {
    console.log(err);
    throw new Error("no voucher");
  }

  function buildVoucherPayload(
    voucherEnv: VoucherEnv,
    clientAssertion: string
  ): VoucherPayload {
    return {
      client_id: voucherEnv.CLIENT_ID,
      grant_type: voucherEnv.GRANT_TYPE,
      client_assertion: clientAssertion,
      client_assertion_type: voucherEnv.ASSERTION_TYPE,
    };
  }
};

const getVoucherSelfSigned = async (
  voucherEnv: VoucherEnv
): Promise<string> => {
  try {
    const KMSGenVoucher: KMSGenVoucher = kmsGenVoucher(voucherEnv);
    return await KMSGenVoucher.buildVoucher();
  } catch (err) {
    console.log(err);
    throw new Error("no voucher");
  }
};

function buildJWTPayload(
  voucherEnv: VoucherEnv,
  partialJWTPayload: Partial<JWTPayload> = {}
): JWTPayload {
  return {
    iss: voucherEnv.ISSUER,
    sub: voucherEnv.SUBJECT,
    aud: voucherEnv.AUDIENCE,
    jti: uuidv4(),
    purposeId: voucherEnv.PURPOSE_ID,
    iat: getIssuedAtTime(),
    exp: getIssuedAtTime() + Number(voucherEnv.SESSION_DURATION_IN_SECONDS),
    ...partialJWTPayload,
  };
}

function buildJWTHeader(
  voucherEnv: VoucherEnv,
  partialJWTHeader: Partial<JWTHeader> = {}
): JWTHeader {
  return {
    alg: voucherEnv.ALG,
    typ: voucherEnv.TYP,
    kid: voucherEnv.KEY_ID,
    ...partialJWTHeader,
  };
}

async function obtainVoucher(
  voucherPayloadOptions: VoucherPayload,
  urlAuthentication: string
): Promise<string> {
  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(voucherPayloadOptions)) {
    formData.append(`${key}`, value);
  }
  const response = await fetch(urlAuthentication, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body: formData,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await response.json();
  if (response.status >= 400) {
    throw Error(
      `Something went wrong: ${JSON.stringify(data ?? response.statusText)}`
    );
  }
  return data.access_token;
}
async function generateClientAssertion(
  jwtHeaderOptions: JWTHeader,
  jwtPayloadOptions: JWTPayload,
  privateKeyPemEncoded: string
) {
  // Load the private key from the protected keystore
  const { alg } = jwtHeaderOptions;
  const privateKey = await importPKCS8(privateKeyPemEncoded, alg);

  // Create a JWT client assertion signed with the private key
  return await new SignJWT(jwtPayloadOptions)
    .setProtectedHeader(jwtHeaderOptions)
    .sign(privateKey);
}

function getPrivateKey(_voucherEnv: VoucherEnv) {
  // return voucherEnv.PRIVATE_KEY;
  return "";
}

export function getIssuedAtTime(): number {
  return Math.round(new Date().getTime() / 1000);
}
