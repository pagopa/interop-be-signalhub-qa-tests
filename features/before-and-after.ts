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
setDefaultTimeout(process.env.CUCUMBER_SET_DEFAULT_TIMEOUT_MS);

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
  console.info(`\n*** BEGIN SIGNALHUB QA TEST SUITE IN ENV [${nodeEnv}] ***`);
  console.info("Start database connection");
  if (
    nodeEnv === "development" &&
    process.env.EXECUTE_TRUNCATE_FOR_TEST_QA === "true"
  ) {
    console.info("Clean database tables: eservice, consumer_eservice");
    await client.query("truncate consumer_eservice;");
    await client.query("truncate eservice;");
    console.info("Set up Database table: eservice");
    await setupEserviceTable();
    console.info("Set up Database table: consumer_eservice");
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
  console.info(`*** END SIGNALHUB QA TEST SUITE IN ENV [${nodeEnv}] ***\n`);
});
