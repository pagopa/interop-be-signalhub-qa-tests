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
  updateConsumerAgreementState,
} from "../data/db";
import { nodeEnv } from "../configs/env";
import { eserviceIdPushSignals } from "../lib/common";

// Increase duration of every step with the following timeout (Default is 5000 milliseconds)
setDefaultTimeout(10 * 1000);

const { Client } = pg;

export const client = new Client({
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// see https://cucumber.io/docs/cucumber/state/?lang=javascript

BeforeAll(async function () {
  await client.connect();
  if (nodeEnv === "development") {
    console.info("Start database connection");
    console.info("Clean database tables");
    await client.query("truncate consumer_eservice;");
    await client.query("truncate eservice;");
    console.info("Set up Database table: ESERVICE");
    await setupEserviceTable();
    console.info("Set up Database table: ESERVICE_CONSUMER");
    await setupConsumerEserviceTable();
  }
});

Before({ tags: "@pull_signals4" }, async function () {
  if (nodeEnv === "development") {
    await updateConsumerAgreementState("DRAFT", eserviceIdPushSignals);
  }
});
// This After reset the state of agreement to ACTIVE after specific test
After({ tags: "@pull_signals4" }, async function () {
  if (nodeEnv === "development") {
    await updateConsumerAgreementState("ACTIVE", eserviceIdPushSignals);
  }
});

Before(async function () {
  await client.query("truncate signal;");
});

AfterAll(async function () {
  console.info("End database connection");
  if (nodeEnv === "development") {
    // await client.query("truncate consumer_eservice");
    // await client.query("truncate eservice;");
  }
  await client.end();
});
