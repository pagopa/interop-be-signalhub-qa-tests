import "../configs/env";
import fs from "fs";
import { AxiosResponse } from "axios";
import {
  SignalConsumerRequest,
  SignalRequest,
  SignalType,
} from "../api/push-signals.models";
import { GetRequestParams } from "../api/pull-signals.models";

const SIGNAL_TYPE_DEFAULT: SignalType = "CREATE";

function getActors() {
  const catalogInteropData = JSON.parse(
    Buffer.from(
      fs.readFileSync(process.env.CATALOG_INTEROP_DATA_PREPARATION_FILE)
    ).toString()
  );
  // console.log(`Catalog Values: ${JSON.stringify(catalogInteropData)}`);
  const signalProducer = catalogInteropData.PRODUCERS[0];
  const eserviceProducer = catalogInteropData.PRODUCERS[1];
  const signalConsumer = catalogInteropData.CONSUMERS[0];
  const eserviceIdPushSignals = signalProducer.eservices[0].id;
  const eserviceIdSecondPushSignals = signalProducer.eservices[1].id;
  const eserviceIdNotAgreementWithConsumer = signalProducer.eservices[1].id;
  const eserviceIdNotPublished = signalProducer.eservices[2].id;
  const eserviceIdPublishedByAnotherOrganization =
    eserviceProducer.eservices[0].id;
  return {
    signalProducer,
    signalConsumer,
    eserviceProducer,
    eserviceIdPushSignals,
    eserviceIdSecondPushSignals,
    eserviceIdNotAgreementWithConsumer,
    eserviceIdNotPublished,
    eserviceIdPublishedByAnotherOrganization,
  };
}

export const {
  signalProducer,
  signalConsumer,
  eserviceProducer,
  eserviceIdPushSignals,
  eserviceIdSecondPushSignals,
  eserviceIdNotAgreementWithConsumer,
  eserviceIdNotPublished,
  eserviceIdPublishedByAnotherOrganization,
} = getActors();

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
    objectId: crypto.randomUUID(),
    signalType: SIGNAL_TYPE_DEFAULT,
    eserviceId: eserviceIdPushSignals,
    objectType: crypto.randomUUID(),
    signalId: getRandomSignalId(),
    ...partialSignal,
  };
}

export function createPullSignalRequest(
  partialPullSignalRequest: Partial<GetRequestParams> = {}
): GetRequestParams {
  return {
    eserviceId: eserviceIdPushSignals, // This has to be Eservice which puts signal on SQS
    signalId: 0, // To Be defined
    ...partialPullSignalRequest,
  };
}

export function createSignalConsumers(): SignalConsumerRequest {
  return {
    signalByConsumers: [
      {
        consumerId: "84871fd4-2fd7-46ab-9d22-f6b452f4b3c5",
        objectId: crypto.randomUUID(),
      },
    ],
    signalType: SIGNAL_TYPE_DEFAULT,
    eserviceId: eserviceIdPushSignals,
    objectType: crypto.randomUUID(),
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
