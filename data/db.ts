import { databaseConfig } from "../configs/db.config";
import { createDbInstance } from "./initDb";

export const clientSchemaSignalhub = createDbInstance({
  database: databaseConfig.dbName,
  host: databaseConfig.dbHost,
  password: databaseConfig.dbPasswordBatchCleanup,
  port: databaseConfig.dbPort,
  username: databaseConfig.dbUserBatchCleanup,
  useSSL: databaseConfig.dbUseSSL,
});

export const clientSchemaInteropAgreement = createDbInstance({
  database: databaseConfig.dbName,
  host: databaseConfig.dbHost,
  password: databaseConfig.dbPasswordAgreement,
  port: databaseConfig.dbPort,
  username: databaseConfig.dbUserAgreement,
  useSSL: databaseConfig.dbUseSSL,
});

export const clientSchemaInteropEservice = createDbInstance({
  database: databaseConfig.dbName,
  host: databaseConfig.dbHost,
  password: databaseConfig.dbPasswordEservice,
  port: databaseConfig.dbPort,
  username: databaseConfig.dbUserEservice,
  useSSL: databaseConfig.dbUseSSL,
});

export const clientSchemaInteropPurpose = createDbInstance({
  database: databaseConfig.dbName,
  host: databaseConfig.dbHost,
  password: databaseConfig.dbPasswordPurpose,
  port: databaseConfig.dbPort,
  username: databaseConfig.dbUserPurpose,
  useSSL: databaseConfig.dbUseSSL,
});

export const clientSchemaInteropDelegation = createDbInstance({
  database: databaseConfig.dbName,
  host: databaseConfig.dbHost,
  password: databaseConfig.dbPasswordDelegation,
  port: databaseConfig.dbPort,
  username: databaseConfig.dbUserDelegation,
  useSSL: databaseConfig.dbUseSSL,
});

export async function cleanupQAData(pattern: string) {
  try {
    await truncateEserviceTable(pattern);
    await truncateAgreementTable(pattern);
    await truncatePurposeTable(pattern);
    await truncateDelegationTable(pattern);
    await truncateSignalTable(pattern);
  } catch (error) {
    console.error(error);
  }
}

async function truncateAgreementTable(pattern: string) {
  await clientSchemaInteropAgreement.query(
    "delete from dev_interop.agreement where agreement_id like $1;",
    pattern,
  );
}

async function truncateDelegationTable(pattern: string) {
  await clientSchemaInteropDelegation.query(
    "delete from dev_interop.delegation where delegation_id like $1;",
    pattern,
  );
}

async function truncateEserviceTable(pattern: string) {
  await clientSchemaInteropEservice.query(
    "delete from dev_interop.eservice where eservice_id like $1;",
    pattern,
  );
}

async function truncatePurposeTable(pattern: string) {
  await clientSchemaInteropPurpose.query(
    "delete from dev_interop.purpose where purpose_id like $1;",
    pattern,
  );
}

async function truncateSignalTable(pattern: string) {
  await clientSchemaSignalhub.query(
    "delete from dev_signalhub.signal where eservice_id like $1;",
    pattern,
  );
}
