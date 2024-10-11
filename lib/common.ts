import "../configs/env";
import fs from "fs";
import { AxiosResponse } from "axios";
import { SignalPayload, SignalType } from "../api/push-signals.models";
import { PullSignalParams } from "../api/pull-signals.models";
import {
  clientSchemaInteropAgreement,
  clientSchemaInteropPurpose,
} from "../data/db.data.preparation";

const SIGNAL_TYPE_DEFAULT: SignalType = "CREATE";

type Agreement = {
  id: string;
  state: string;
  eservice: string;
  name: string;
  descriptor: string;
  purpose: string;
};

type Purpose = {
  id: string;
  version: string;
  state: string;
  eservice: string;
  name: string;
};

function getActors() {
  const catalogInteropData = JSON.parse(
    Buffer.from(
      fs.readFileSync(process.env.CATALOG_INTEROP_DATA_PREPARATION_FILE)
    ).toString()
  );
  const signalProducer = catalogInteropData.PRODUCERS[0].organization;
  const anotherSignalProducer = catalogInteropData.PRODUCERS[1].organization;
  const signalConsumer = catalogInteropData.CONSUMERS[0].organization;

  const eserviceIdPushSignals = signalProducer.eservices[0].id;
  const eserviceIdSecondPushSignals = signalProducer.eservices[1].id;
  const eserviceIdAgreementSuspendedWithConsumer =
    signalProducer.eservices[2].id;
  const eserviceIdNotPublished = signalProducer.eservices[2].id;
  const eserviceIdPublishedByAnotherOrganization =
    anotherSignalProducer.eservices[0].id;

  return {
    signalProducer,
    signalConsumer,
    anotherSignalProducer,
    eserviceIdPushSignals,
    eserviceIdSecondPushSignals,
    eserviceIdAgreementSuspendedWithConsumer,
    eserviceIdNotPublished,
    eserviceIdPublishedByAnotherOrganization,
  };
}

export const {
  signalProducer,
  signalConsumer,
  eserviceIdPushSignals,
  anotherSignalProducer,
  eserviceIdNotPublished,
  eserviceIdPublishedByAnotherOrganization,
  eserviceIdSecondPushSignals,
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

export function getConsumerOrganization(): string {
  const { id } = signalConsumer;
  return id;
}

export function getAgreement(eservice: string): Agreement {
  const { agreements } = signalConsumer;
  return agreements
    .filter((agreement: Agreement) => agreement.name === eservice)
    .shift();
}

export async function createAgreement(
  agreement: Agreement,
  organizationId: string
): Promise<void> {
  const { id, eservice, descriptor, state } = agreement;
  const query = {
    text: "INSERT INTO dev_interop.agreement (agreement_id, eservice_id, consumer_id, descriptor_id, state) values ($1, $2, $3, $4, $5) ON CONFLICT(agreement_id) DO NOTHING",
    values: [id, eservice, organizationId, descriptor, state],
  };
  await clientSchemaInteropAgreement.query(query);
}

export function getPurpose(eservice: string): Purpose {
  const { purposes } = signalConsumer;
  return purposes
    .filter((purpose: Purpose) => purpose.name === eservice)
    .shift();
}

export async function createPurpose(
  purpose: Purpose,
  organizationId: string
): Promise<void> {
  const { state, version, eservice, id } = purpose;
  const query = {
    text: "INSERT INTO DEV_INTEROP.purpose(purpose_id, purpose_version_id, purpose_state, eservice_id, consumer_id) values ($1, $2, $3, $4, $5) ON CONFLICT(purpose_id) DO NOTHING",
    values: [id, version, state, eservice, organizationId],
  };
  await clientSchemaInteropPurpose.query(query);
}

export function createSignal(
  partialSignal: Partial<SignalPayload> = {}
): SignalPayload {
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
  partialPullSignalRequest: Partial<PullSignalParams> = {}
): PullSignalParams {
  return {
    eserviceId: eserviceIdPushSignals, // This has to be Eservice which puts signal on SQS
    signalId: 0, // To Be defined
    ...partialPullSignalRequest,
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
