import "../configs/env";
import { AxiosResponse } from "axios";
import { SignalPayload, SignalType } from "../api/push-signals.models";
import { PullSignalParams } from "../api/pull-signals.models";
import { clientSchemaInteropEservice } from "../data/db.data.preparation";
import {
  clientSchemaInteropAgreement,
  clientSchemaInteropPurpose,
} from "../data/db.data.preparation";
import { Eservice, Agreement, Purpose } from "./data.interop";

const SIGNAL_TYPE_DEFAULT: SignalType = "CREATE";

export const signalProducer = undefined;
export const signalConsumer = undefined;
export const anotherSignalProducer = undefined;

export async function createOrUpdateEservice(
  eservice: Eservice,
  organizationId: string
) {
  const { id, descriptor, state, enable_signal_hub } = eservice;
  const query = {
    text: "INSERT INTO dev_interop.eservice (eservice_id, producer_id, descriptor_id, state, enabled_signal_hub) values ($1, $2, $3, $4,$5) ON CONFLICT(eservice_id, producer_id, descriptor_id) DO UPDATE SET state = EXCLUDED.state, enabled_signal_hub = EXCLUDED.enabled_signal_hub",
    values: [id, organizationId, descriptor, state, enable_signal_hub],
  };

  await clientSchemaInteropEservice.query(query);
}

export async function updateEserviceSHOptions(
  eServiceId: string,
  isEnabledToSH: boolean
) {
  const query = {
    text: "UPDATE dev_interop.eservice SET enabled_signal_hub = $1 WHERE eservice_id = $2",
    values: [isEnabledToSH, eServiceId],
  };

  await clientSchemaInteropEservice.query(query);
}

export async function createOrUpdateAgreement(
  agreement: Agreement,
  organizationId: string
): Promise<void> {
  const { id, eservice, descriptor, state } = agreement;
  const query = {
    text: "INSERT INTO dev_interop.agreement (agreement_id, eservice_id, consumer_id, descriptor_id, state) values ($1, $2, $3, $4, $5) ON CONFLICT(agreement_id) DO UPDATE SET state = EXCLUDED.state",
    values: [id, eservice, organizationId, descriptor, state],
  };
  await clientSchemaInteropAgreement.query(query);
}

export async function createOrUpdatePurpose(
  purpose: Purpose,
  organizationId: string
): Promise<void> {
  const { state, version, eservice, id } = purpose;
  const query = {
    text: "INSERT INTO DEV_INTEROP.purpose(purpose_id, purpose_version_id, purpose_state, eservice_id, consumer_id) values ($1, $2, $3, $4, $5) ON CONFLICT(purpose_id) DO UPDATE SET purpose_state = EXCLUDED.purpose_state",
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
    eserviceId: "this-is-a-fake-eservice-id",
    objectType: crypto.randomUUID(),
    signalId: getRandomSignalId(),
    ...partialSignal,
  };
}

export function createPullSignalRequest(
  partialPullSignalRequest: Partial<PullSignalParams> = {}
): PullSignalParams {
  return {
    eserviceId: "1", // This has to be Eservice which puts signal on SQS
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

export const getRandomInt = () =>
  Number(Math.random() * Number.MAX_SAFE_INTEGER).toFixed(0);

export async function sleep(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
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
