import {
  KMSClient,
  SignCommand,
  SignCommandOutput,
  SigningAlgorithmSpec,
  SignRequest,
} from "@aws-sdk/client-kms";
import { v4 as uuidv4 } from "uuid";

import { VoucherEnv } from "./voucher.env";

const JWT_SIGNING_ALGORITHM = "RSASSA_PKCS1_V1_5_SHA_256";
const JWT_HEADER_ALGORITHM = "RS256";
const JWT_HEADER_TYP = "at+jwt";
const JWT_HEADER_USE = "sig";

type JWTHeader = {
  alg: string;
  kid: string;
  typ: string;
  use: string;
};

type JWTPayload = {
  aud: string;
  client_id: string;
  exp: number;
  iat: number;
  iss: string;
  jti: string;
  nbf: number;
  organizationId: string;
  role: string;
  sub: string;
};

export const voucherGenerator = (voucherEnv: VoucherEnv) => {
  const kms: KMSClient = new KMSClient();

  return {
    async buildSelfSignedVoucher(
      generateExpiredToken = false,
    ): Promise<string> {
      try {
        const token = generateExpiredToken
          ? createExpiredToken(voucherEnv)
          : createToken(voucherEnv);
        const signedToken = await signToken(voucherEnv.KMS_KEY_ID, token, kms);
        return `${token}.${base64EncodeBuffer(signedToken)}`;
      } catch (err: unknown) {
        console.log(err);
      }
      return "";
    },
  };
};

export type VoucherGenerator = ReturnType<typeof voucherGenerator>;

function base64EncodeBuffer(content: Uint8Array): string {
  return removePadding(Buffer.from(content).toString("base64"));
}

function base64EncodeObject(obj: unknown): string {
  return removePadding(Buffer.from(JSON.stringify(obj)).toString("base64"));
}

function createExpiredToken(voucherEnv: VoucherEnv): string {
  const header: JWTHeader = createHeader(voucherEnv);
  const payload: JWTPayload = createPayload(voucherEnv);

  const oneDayInMs = 864e5; // 24 * 60 * 60 * 1000
  payload.exp = Math.floor((Date.now() - oneDayInMs) / 1000);

  return `${base64EncodeObject(header)}.${base64EncodeObject(payload)}`;
}

function createHeader(voucherEnv: VoucherEnv): JWTHeader {
  return {
    alg: JWT_HEADER_ALGORITHM,
    kid: voucherEnv.KEY_ID,
    typ: JWT_HEADER_TYP,
    use: JWT_HEADER_USE,
  };
}

function createPayload(voucherEnv: VoucherEnv): JWTPayload {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);

  const subject = voucherEnv.SUBJECT ?? "";
  const issuer = voucherEnv.ISSUER ?? "";
  const audience = voucherEnv.AUDIENCE ?? "";
  const clientId = voucherEnv.CLIENT_ID ?? "";
  const organizationId = voucherEnv.ORGANIZATION_ID ?? "";
  const expireIn = 3600;

  const jwtPayload: JWTPayload = {
    aud: audience,
    client_id: clientId,
    exp: currentTimeInSeconds + expireIn,
    iat: currentTimeInSeconds,
    iss: issuer,
    jti: uuidv4(),
    nbf: currentTimeInSeconds,
    organizationId,
    role: "m2m",
    sub: subject,
  };
  return jwtPayload;
}

function createToken(voucherEnv: VoucherEnv): string {
  const header: JWTHeader = createHeader(voucherEnv);
  const payload: JWTPayload = createPayload(voucherEnv);
  return `${base64EncodeObject(header)}.${base64EncodeObject(payload)}`;
}

function removePadding(base64Text: string): string {
  return base64Text.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
async function signToken(
  kmsKeyId: string,
  token: string,
  kms: KMSClient,
): Promise<Uint8Array> {
  const signReq: SignRequest = {
    KeyId: kmsKeyId,
    Message: Buffer.from(token),
    SigningAlgorithm: JWT_SIGNING_ALGORITHM as SigningAlgorithmSpec,
  };

  const signCommand = new SignCommand(signReq);
  const signResult: SignCommandOutput = await kms.send(signCommand);
  const signedTokenBuffer = signResult.Signature;
  if (!signedTokenBuffer) {
    throw new Error("Failed to generate signature.");
  }
  return signedTokenBuffer;
}
