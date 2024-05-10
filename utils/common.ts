import { v4 as uuidv4 } from "uuid";
import { importPKCS8, SignJWT } from "jose";
import { AxiosResponse } from "axios";
import {
  SignalConsumerRequest,
  SignalRequest,
  SignalType,
} from "../api/push-signals.models";
import "../configs/env";
import { GetRequestParams } from "../api/pull-signals.models";

export const WAIT_BEFORE_PUSHING_DUPLICATED_SIGNALID_IN_MS = 5000;
export const ESERVICEID_PROVIDED_BY_ORGANIZATION =
  "31b4e4e6-855d-42fa-9705-28bc7f8545ff";
export const ESERVICEID_PROVIDED_BY_SAME_ORGANIZATION =
  "3a023c23b-7662-4971-994e-0eb9adabc728";
export const ESERVICEID_PROVIDED_BY_SAME_ORGANIZATION_NOT_PUBLISHED =
  "4a127c23c-7662-4974-994e-0eb9adabc999";
export const ESERVICEID_PROVIDED_BY_ANOTHER_ORGANIZATION =
  "16d64180-e352-442e-8a91-3b2ae77ca1df";

const SIGNAL_TYPE_DEFAULT: SignalType = "CREATE";
const OBJECT_TYPE_DEFAULT = "FX65ZU937QLm6iPwIzlt4";
const OBJECT_ID_DEFAULT = "on3ueZN9YC1Ew8c6RAuYC";

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

enum VoucherType {
  PRODUCER,
  CONSUMER,
}

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

const getPrivateKeyFromUserType = (userType: VoucherType) => {
  switch (userType) {
    case VoucherType.PRODUCER:
      return process.env.SH_PUSH_PRIVATE_KEY ?? "";
    case VoucherType.CONSUMER:
      return process.env.SH_PULL_PRIVATE_KEY ?? "";
    default:
      return "";
  }
};
export const getVoucherForProducer = async (
  partialJWTPayload: Partial<JWTPayload> = {}
) =>
  await getVoucher(VoucherType.PRODUCER, {
    ...partialJWTPayload,
  });

export const getVoucherForConsumer = async (
  partialJWTPayload: Partial<JWTPayload> = {}
) =>
  await getVoucher(VoucherType.CONSUMER, {
    purposeId: "InsertPurposeID",
    ...partialJWTPayload,
  });

const getVoucher = async (
  voucherType: VoucherType,
  partialJWTPayload: Partial<JWTPayload> = {}
): Promise<string> => {
  try {
    const jwtHeader: JWTHeader = buildJWTHeader();
    const jwtPayload: JWTPayload = buildJWTPayload(partialJWTPayload);
    const privateKeyPem = getPrivateKeyFromUserType(voucherType);
    const clientAssertion = await generateClientAssertion(
      jwtHeader,
      jwtPayload,
      privateKeyPem
    );

    const voucherPayload: VoucherPayload = buildVoucherPayload(clientAssertion);
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
      client_id: process.env.CLIENT_ID,
      grant_type: process.env.GRANT_TYPE,
      client_assertion: clientAssertion,
      client_assertion_type: process.env.ASSERTION_TYPE,
    };
  }
};

function getIssuedAtTime(): number {
  return Math.round(new Date().getTime() / 1000);
}
function buildJWTPayload(
  partialJWTPayload: Partial<JWTPayload> = {}
): JWTPayload {
  return {
    iss: process.env.ISSUER,
    sub: process.env.SUBJECT,
    aud: process.env.AUDIENCE,
    jti: uuidv4(),
    purposeId: process.env.PURPOSE_ID,
    iat: getIssuedAtTime(),
    exp: getIssuedAtTime() + Number(process.env.SESSION_DURATION_IN_SECONDS),
    ...partialJWTPayload,
  };
}

function buildJWTHeader(partialJWTHeader: Partial<JWTHeader> = {}): JWTHeader {
  return {
    alg: "RS256",
    typ: "JWT",
    kid: process.env.KEY_ID,
    ...partialJWTHeader,
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
    objectId: OBJECT_ID_DEFAULT,
    signalType: SIGNAL_TYPE_DEFAULT,
    eserviceId: ESERVICEID_PROVIDED_BY_ORGANIZATION,
    objectType: OBJECT_TYPE_DEFAULT,
    signalId: getRandomSignalId(),
    ...partialSignal,
  };
}

export function createPullSignalRequest(
  partialPullSignalRequest: Partial<GetRequestParams> = {}
): GetRequestParams {
  return {
    eserviceId: ESERVICEID_PROVIDED_BY_ORGANIZATION, // This has to be Eservice which puts signal on SQS
    signalId: 0, // To Be defined
    ...partialPullSignalRequest,
  };
}

export function createSignalConsumers(): SignalConsumerRequest {
  return {
    signalByConsumers: [
      {
        consumerId: "84871fd4-2fd7-46ab-9d22-f6b452f4b3c5",
        objectId: OBJECT_ID_DEFAULT,
      },
    ],
    signalType: SIGNAL_TYPE_DEFAULT,
    eserviceId: ESERVICEID_PROVIDED_BY_ORGANIZATION,
    objectType: OBJECT_TYPE_DEFAULT,
    signalId: getRandomSignalId(),
  };
}

export function getRandomSignalId() {
  return parseInt(
    Number(Math.random() * Number.MAX_SAFE_INTEGER).toFixed(0),
    10
  );
}

export async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
