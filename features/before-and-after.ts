import pg from "pg";
import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import {
  setupConsumerEserviceTable,
  setupEserviceAgreementTable as setupEserviceTable,
} from "../db";
import { nodeEnv } from "../configs/env";

// Increase duration of every step with the following timeout (Default is 5000 milliseconds)
setDefaultTimeout(10 * 1000);

const { Client } = pg;

const client = new Client({
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

BeforeAll(async function () {
  await client.connect();
  if (nodeEnv === "development") {
    console.info("Set up Database table: E_SERVICE");
    await setupEserviceTable(client);
    console.info("Set up Database table: E_SERVICE_CONSUMER");
    await setupConsumerEserviceTable(client);
  }
});
Before(async function () {
  await client.query("truncate signal;");
});

After(function () {
  // console.log("AFTER");
});

AfterAll(async function () {
  if (nodeEnv === "DEVELOPMENT") {
    console.info("Clean database tables");
    await client.query("truncate consumer_eservice");
    await client.query("truncate eservice;");
  }

  await client.end();
});
