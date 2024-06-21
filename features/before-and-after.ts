import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import {
  connect,
  disconnect,
  truncateSignalTable,
  updateConsumerAgreementState,
} from "../data/db";
import { nodeEnv } from "../configs/env";
import { eserviceIdPushSignals } from "../lib/common";

// Increase duration of every step with the following timeout (Default is 5000 milliseconds)
setDefaultTimeout(process.env.CUCUMBER_SET_DEFAULT_TIMEOUT_MS);

BeforeAll(async function () {
  console.info(`\n*** BEGIN SIGNALHUB QA TEST SUITE IN ENV [${nodeEnv}] ***`);
  console.info("Start database connection");
  await connect();
});

Before({ tags: "@pull_signals4" }, async function () {
  if (nodeEnv === "development" || nodeEnv === "local") {
    await updateConsumerAgreementState("DRAFT", eserviceIdPushSignals);
  }
});
// This After reset the state of agreement to ACTIVE after specific test
After({ tags: "@pull_signals4" }, async function () {
  if (nodeEnv === "development" || nodeEnv === "local") {
    await updateConsumerAgreementState("ACTIVE", eserviceIdPushSignals);
  }
});

Before(async function () {
  // see https://cucumber.io/docs/cucumber/state/?lang=javascript
  await truncateSignalTable();
});

AfterAll(async function () {
  console.info("End database connection");
  await disconnect();
  console.info(`*** END SIGNALHUB QA TEST SUITE IN ENV [${nodeEnv}] ***\n`);
});
