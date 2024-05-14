import "../configs/env";
import fs from "fs";
import { AxiosResponse } from "axios";
import {
  SignalConsumerRequest,
  SignalRequest,
  SignalType,
} from "../api/push-signals.models";
import { GetRequestParams } from "../api/pull-signals.models";

export const ESERVICEID_PROVIDED_BY_SAME_ORGANIZATION_NOT_PUBLISHED =
  "4a127c23c-7662-4974-994e-0eb9adabc999";
export const ESERVICEID_PROVIDED_BY_ANOTHER_ORGANIZATION =
  "16d64180-e352-442e-8a91-3b2ae77ca1df";

const SIGNAL_TYPE_DEFAULT: SignalType = "CREATE";
const OBJECT_TYPE_DEFAULT = "FX65ZU937QLm6iPwIzlt4";
const OBJECT_ID_DEFAULT = "on3ueZN9YC1Ew8c6RAuYC";

function getActors() {
  const catalogInteropData = JSON.parse(
    Buffer.from(
      fs.readFileSync(process.env.CATALOG_INTEROP_DATA_PREPARATION_FILE)
    ).toString()
  );
  // console.log(`Catalog Values: ${JSON.stringify(catalogInteropData)}`);
  const signalProducer = catalogInteropData.SIGNAL_PRODUCERS[0];
  console.log(`signalProducer: ${JSON.stringify(signalProducer)}`);
  const signalConsumer = catalogInteropData.SIGNAL_CONSUMERS[0];
  return {
    signalProducer,
    signalConsumer,
  };
}

export const actors = getActors();

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
    eserviceId: actors.signalProducer.eservices.domicili_digitali.id,
    objectType: OBJECT_TYPE_DEFAULT,
    signalId: getRandomSignalId(),
    ...partialSignal,
  };
}

export function createPullSignalRequest(
  partialPullSignalRequest: Partial<GetRequestParams> = {}
): GetRequestParams {
  return {
    eserviceId: actors.signalProducer.eservices.domicili_digitali.id, // This has to be Eservice which puts signal on SQS
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
    eserviceId: actors.signalProducer.eservices.domicili_digitali.id,
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
