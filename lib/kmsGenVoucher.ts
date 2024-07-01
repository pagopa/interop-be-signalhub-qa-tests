import {
  KMSClient,
  SignCommand,
  SignCommandOutput,
  SignRequest,
  SigningAlgorithmSpec,
} from "@aws-sdk/client-kms";
import { v4 as uuidv4 } from "uuid";
import { VoucherEnv } from "./voucher.env";

const JWT_SIGNING_ALGORITHM = "RSASSA_PKCS1_V1_5_SHA_256";
const JWT_HEADER_ALGORITHM = "RS256";

interface Claims {
  aud: string;
  sub: string;
  nbf: number;
  iss: string;
  exp: number;
  iat: number;
  jti: string;
  client_id: string;
  purposeId: string;
}

export const kmsGenVoucher = (voucherEnv: VoucherEnv) => {
  const kms: KMSClient = new KMSClient();

  return {
    async buildVoucher(): Promise<string> {
      try {
        const token = createToken(voucherEnv);
        const signReq: SignRequest = {
          KeyId: voucherEnv.KMS_KEY_ID,
          Message: Buffer.from(token),
          SigningAlgorithm: JWT_SIGNING_ALGORITHM as SigningAlgorithmSpec,
        };

        const signCommand = new SignCommand(signReq);
        const signResult: SignCommandOutput = await kms.send(signCommand);
        const signedTokenBuffer = signResult.Signature;
        if (!signedTokenBuffer) {
          throw new Error("Failed to generate signature.");
        }

        return `${token}.${removePadding(
          Buffer.from(signedTokenBuffer).toString("base64")
        )}`;
      } catch (err: unknown) {
        console.log(err);
      }
      return "";
    },
  };
};

export type KMSGenVoucher = ReturnType<typeof kmsGenVoucher>;

function createToken(voucherEnv: VoucherEnv): string {
  const header = createHeader(voucherEnv);
  const payload = createPayload(voucherEnv);

  return `${header}.${payload}`;
}

function createHeader(voucherEnv: VoucherEnv): string {
  const obj = {
    typ: "at+jwt",
    use: "sig",
    alg: JWT_HEADER_ALGORITHM,
    kid: voucherEnv.KEY_ID,
  };

  return removePadding(Buffer.from(JSON.stringify(obj)).toString("base64"));
}

function createPayload(voucherEnv: VoucherEnv): string {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);

  const subject = voucherEnv.SUBJECT ?? "";
  const issuer = voucherEnv.ISSUER ?? "";
  const audience = voucherEnv.AUDIENCE ?? "";
  const purposeId = voucherEnv.PURPOSE_ID ?? "";
  const clientId = voucherEnv.CLIENT_ID ?? "";
  const expireIn = 3600;

  const claims: Claims = {
    aud: audience,
    sub: subject,
    nbf: currentTimeInSeconds,
    iss: issuer,
    exp: currentTimeInSeconds + expireIn,
    iat: currentTimeInSeconds,
    jti: uuidv4(),
    client_id: clientId,
    purposeId,
  };

  return removePadding(Buffer.from(JSON.stringify(claims)).toString("base64"));
}

function removePadding(base64Text: string): string {
  return base64Text.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
