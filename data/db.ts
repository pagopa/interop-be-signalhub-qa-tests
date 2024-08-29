import { databaseConfig } from "../configs/db.config";
import { createDbInstance } from "./initDb";

export const clientSchemaSignal = createDbInstance({
  database: databaseConfig.dbName,
  host: databaseConfig.dbHost,
  port: databaseConfig.dbPort,
  username: databaseConfig.dbUserBatchCleanup,
  password: databaseConfig.dbPasswordBatchCleanup,
  useSSL: databaseConfig.dbUseSSL,
});

export const connectSignal = async () => await clientSchemaSignal.connect();

export async function truncateSignalTable() {
  await clientSchemaSignal.query("delete from dev_signalhub.signal;");
}
