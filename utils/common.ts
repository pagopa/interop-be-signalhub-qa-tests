import { v4 as uuidv4 } from "uuid";
import { importPKCS8, SignJWT } from "jose";
import "../configs/env";
import { AxiosResponse } from "axios";
import { SignalRequest } from "../api/push";

export type VoucherPayload = {
  client_id: string;
  grant_type: string;
  client_assertion: string;
  client_assertion_type: string;
};

export async function obtainVoucher(
  voucherPayloadOptions: VoucherPayload,
  urlAuthentication: string
): Promise<string> {
  const formData = new URLSearchParams();
  for (const [key, value] of Object.entries(voucherPayloadOptions)) {
    // console.log(`Key: ${key}, Value: ${value}`);
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
  if (response.status === 200) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();
    // console.log('dump voucher', data);
    return data.access_token;
  }
  return "";
}

export type JWTHeader = {
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

export async function generateClientAssertion(
  jwtHeaderOptions: JWTHeader,
  jwtPayloadOptions: JWTPayload,
  privateKeyPemEncoded: string
) {
  // Load the private key from the protected keystore
  const { alg } = jwtHeaderOptions;
  const privateKey = await importPKCS8(privateKeyPemEncoded, alg);

  // Create a JWT client assertion signed with the private key
  // console.log('client assertion', assertion);
  return await new SignJWT(jwtPayloadOptions)
    .setProtectedHeader(jwtHeaderOptions)
    .sign(privateKey);
}

export const getVoucher = async (): Promise<string> => {
  try {
    const jwtHeader: JWTHeader = buildJWTHeader();
    const jwtPayload: JWTPayload = buildJWTPayload();
    const privateKeyPem = process.env.SH_PUSH_PRIVATE_KEY ?? "";
    const clientAssertion = await generateClientAssertion(
      jwtHeader,
      jwtPayload,
      privateKeyPem
    );
    const voucherPayload: VoucherPayload = buildVoucherPayload(clientAssertion);
    // console.log("voucherPayload", voucherPayload, process.env.URL_AUTH_TOKEN);
    return await obtainVoucher(
      voucherPayload,
      process.env.URL_AUTH_TOKEN ?? ""
    );
  } catch (err) {
    console.log(err);
    throw new Error("no voucher");
  }

  function buildVoucherPayload(clientAssertion: string): VoucherPayload {
    return {
      client_id: process.env.CLIENT_ID ?? "",
      grant_type: process.env.GRANT_TYPE ?? "",
      client_assertion: clientAssertion,
      client_assertion_type: process.env.ASSERTION_TYPE ?? "",
    };
  }
};

function getIssuedAtTime(): number {
  return Math.round(new Date().getTime() / 1000);
}
function buildJWTPayload(): JWTPayload {
  return {
    iss: process.env.ISSUER ?? "",
    sub: process.env.SUBJECT ?? "",
    aud: process.env.AUDIENCE ?? "",
    jti: uuidv4(),
    purposeId: process.env.PURPOSE_ID ?? "",
    iat: getIssuedAtTime(),
    exp: getIssuedAtTime() + Number(process.env.SESSION_DURATION_IN_SECONDS),
  };
}

function buildJWTHeader(): JWTHeader {
  return {
    alg: "RS256",
    typ: "JWT",
    kid: process.env.KEY_ID ?? "",
  };
}

export function getAuthorizationHeader(token: string) {
  return { headers: { Authorization: "Bearer " + token } } as const;
}

export function assertValidResponse<T>(response: AxiosResponse<T>) {
  if (response.status >= 400) {
    throw Error(
      `Something went wrong: ${JSON.stringify(
        response.data ?? response.statusText
      )}`
    );
  }
}

export function createSignal(
  partialSignal: Partial<SignalRequest> = {}
): SignalRequest {
  return {
    objectId: "on3ueZN9YC1Ew8c6RAuYC",
    signalType: "CREATE",
    eserviceId: "16d64180-e352-442e-8a91-3b2ae77ca1df",
    objectType: "FX65ZU937QLm6iPwIzlt4",
    signalId: 1,
    ...partialSignal,
  };
}
