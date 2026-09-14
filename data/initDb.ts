import { ConnectionString } from "connection-string";
import pgPromise, { IDatabase } from "pg-promise";
import {
  IClient,
  IConnectionParameters,
} from "pg-promise/typescript/pg-subset";

export type DB = IDatabase<unknown>;

export function createDbInstance({
  database,
  host,
  password,
  port,
  username,
  useSSL,
}: {
  database: string;
  host: string;
  password: string;
  port: number;
  username: string;
  useSSL: boolean;
}): DB {
  const pgp = pgPromise();

  const conData = new ConnectionString(
    `postgresql://${username}:${password}@${host}:${port}/${database}`,
  );

  const dbConfig: IConnectionParameters<IClient> = {
    allowExitOnIdle: true,
    database: conData.path !== undefined ? conData.path[0] : "",
    host: conData.hostname,
    password: conData.password,
    port: conData.port,
    ssl: useSSL ? { rejectUnauthorized: false } : undefined,
    user: conData.user,
  };

  // creating a Database instance
  return pgp(dbConfig);
}
