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

export async function truncateEserviceTable() {
  await clientSchemaInteropAgreement.query("delete from dev_interop.eservice;");
}

export async function truncateAgreementTable() {
  await clientSchemaInteropAgreement.query(
    "delete from dev_interop.agreement;"
  );
}
