import { databaseConfig } from "../configs/db.config";
import { createDbInstance } from "./initDb";

export const clientSchemaSignalhub = createDbInstance({
  database: databaseConfig.dbName,
  host: databaseConfig.dbHost,
  port: databaseConfig.dbPort,
  username: databaseConfig.dbUserBatchCleanup,
  password: databaseConfig.dbPasswordBatchCleanup,
  useSSL: databaseConfig.dbUseSSL,
});

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

async function truncateEserviceTable(pattern: string) {
  await clientSchemaInteropEservice.query(
    "delete from dev_interop.eservice where eservice_id like $1;",
    pattern
  );
}

async function truncateAgreementTable(pattern: string) {
  await clientSchemaInteropAgreement.query(
    "delete from dev_interop.agreement where agreement_id like $1;",
    pattern
  );
}

async function truncatePurposeTable(pattern: string) {
  await clientSchemaInteropPurpose.query(
    "delete from dev_interop.purpose where purpose_id like $1;",
    pattern
  );
}

async function truncateSignalTable(pattern: string) {
  await clientSchemaSignalhub.query(
    "delete from dev_signalhub.signal where eservice_id like $1;",
    pattern
  );
}

export async function cleanupQAData(pattern: string) {
  try {
    await truncateEserviceTable(pattern);
    await truncateAgreementTable(pattern);
    await truncatePurposeTable(pattern);
    await truncateSignalTable(pattern);
  } catch (error) {
    console.error(error);
  }
}
