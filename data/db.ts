import pg from "pg";
import {
  signalProducer,
  signalConsumer,
  eserviceProducer,
} from "../lib/common";

const { Client } = pg;

export const clientSchemaInterop = new Client({
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER_BATCH_UPDATE,
  password: process.env.DB_PASSWORD_BATCH_UPDATE,
  ssl:
    process.env.DB_USE_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined,
});

export const clientSchemaSignal = new Client({
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER_BATCH_CLEANUP,
  password: process.env.DB_PASSWORD_BATCH_CLEANUP,
  ssl:
    process.env.DB_USE_SSL === "true"
      ? { rejectUnauthorized: false }
      : undefined,
});

export const connectInterop = async () => await clientSchemaInterop.connect();
export const disconnectInterop = async () => await clientSchemaInterop.end();
export const connectSignal = async () => await clientSchemaSignal.connect();
export const disconnectSignal = async () => await clientSchemaSignal.end();
export async function truncateEserviceTable() {
  await clientSchemaInterop.query("delete from dev_interop.eservice;");
}
export async function setupEserviceTable() {
  const allProducers = [signalProducer, eserviceProducer];
  let count = 0;
  for (const producer of allProducers) {
    const { id, eservices } = producer;
    for (const eservice of eservices.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any) => !("skip_insert" in e)
    )) {
      const query = {
        text: "INSERT INTO dev_interop.eservice (eservice_id, producer_id, descriptor_id, event_id, state) values ($1, $2, $3, $4, $5) ON CONFLICT(eservice_id, producer_id, descriptor_id) DO NOTHING",
        values: [eservice.id, id, eservice.descriptor, ++count, eservice.state],
      };
      await clientSchemaInterop.query(query);
    }
  }
}
export async function truncateAgreementTable() {
  await clientSchemaInterop.query("delete from dev_interop.agreement;");
}

export async function truncateSignalTable() {
  await clientSchemaSignal.query("delete from dev_signalhub.signal;");
}
export async function setupAgreementTable() {
  const { id, agreements } = signalConsumer;
  let count = 0;
  for (const agreement of agreements.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => !("skip_insert" in e)
  )) {
    const query = {
      text: "INSERT INTO dev_interop.agreement (agreement_id, eservice_id, consumer_id, descriptor_id, event_id, state) values ($1, $2, $3, $4, $5,$6) ON CONFLICT(agreement_id) DO NOTHING",
      values: [
        agreement.id,
        agreement.eservice,
        id,
        agreement.descriptor,
        ++count,
        agreement.state,
      ],
    };

    await clientSchemaInterop.query(query);
  }
}

export async function setupPurposeTable(): Promise<void> {
  const items = [signalProducer, eserviceProducer, signalConsumer];
  // eslint-disable-next-line functional/no-let

  for (const organization of items) {
    const { id: consumerId, purposes } = organization;
    for (const purpose of purposes.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any) => !("skip_insert" in e)
    )) {
      const { state, version, eservice, id } = purpose;

      const query = {
        text: "INSERT INTO DEV_INTEROP.purpose(purpose_id, purpose_version_id, purpose_state, eservice_id, consumer_id) values ($1, $2, $3, $4, $5) ON CONFLICT(purpose_id) DO NOTHING",
        values: [id, version, state, eservice, consumerId],
      };
      await clientSchemaInterop.query(query);
    }
  }
}
