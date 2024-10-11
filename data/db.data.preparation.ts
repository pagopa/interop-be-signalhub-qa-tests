import {
  signalProducer,
  signalConsumer,
  anotherSignalProducer,
} from "../lib/common";
import { databaseConfig } from "../configs/db.config";
import { createDbInstance } from "./initDb";

export const clientSchemaInteropAgreement = createDbInstance({
  database: databaseConfig.dbName,
  host: databaseConfig.dbHost,
  port: databaseConfig.dbPort,
  username: databaseConfig.dbUserAgreement,
  password: databaseConfig.dbPasswordAgreement,
  useSSL: databaseConfig.dbUseSSL,
});

export const clientSchemaInteropEservice = createDbInstance({
  database: databaseConfig.dbName,
  host: databaseConfig.dbHost,
  port: databaseConfig.dbPort,
  username: databaseConfig.dbUserEservice,
  password: databaseConfig.dbPasswordEservice,
  useSSL: databaseConfig.dbUseSSL,
});

export const clientSchemaInteropPurpose = createDbInstance({
  database: databaseConfig.dbName,
  host: databaseConfig.dbHost,
  port: databaseConfig.dbPort,
  username: databaseConfig.dbUserPurpose,
  password: databaseConfig.dbPasswordPurpose,
  useSSL: databaseConfig.dbUseSSL,
});

// export const connectInterop = async () =>
//   await clientSchemaInteropAgreement.connect();

export async function truncateEserviceTable() {
  await clientSchemaInteropAgreement.query("delete from dev_interop.eservice;");
}
export async function setupEserviceTable() {
  const allProducers = [signalProducer, anotherSignalProducer];
  for (const producer of allProducers) {
    const { id, eservices } = producer;
    for (const eservice of eservices.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any) => !("skip_insert" in e)
    )) {
      const query = {
        text: "INSERT INTO dev_interop.eservice (eservice_id, producer_id, descriptor_id, state) values ($1, $2, $3, $4) ON CONFLICT(eservice_id, producer_id, descriptor_id) DO NOTHING",
        values: [eservice.id, id, eservice.descriptor, eservice.state],
      };
      await clientSchemaInteropEservice.query(query);
    }
  }
}
export async function truncateAgreementTable() {
  await clientSchemaInteropAgreement.query(
    "delete from dev_interop.agreement;"
  );
}

export async function setupAgreementTable() {
  const { id, agreements } = signalConsumer;
  for (const agreement of agreements.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => !("skip_insert" in e)
  )) {
    const query = {
      text: "INSERT INTO dev_interop.agreement (agreement_id, eservice_id, consumer_id, descriptor_id, state) values ($1, $2, $3, $4, $5) ON CONFLICT(agreement_id) DO NOTHING",
      values: [
        agreement.id,
        agreement.eservice,
        id,
        agreement.descriptor,
        agreement.state,
      ],
    };

    await clientSchemaInteropAgreement.query(query);
  }
}

export async function setupPurposeTable(): Promise<void> {
  const items = [signalProducer, anotherSignalProducer, signalConsumer];
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
      await clientSchemaInteropPurpose.query(query);
    }
  }
}
