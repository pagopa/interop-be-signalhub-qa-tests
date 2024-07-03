import {
  AfterAll,
  Before,
  BeforeAll,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import {
  connectInterop,
  disconnectInterop,
  truncateSignalTable,
  connectSignal,
  disconnectSignal,
} from "../data/db";
import { nodeEnv } from "../configs/env";

// Increase duration of every step with the following timeout (Default is 5000 milliseconds)
setDefaultTimeout(process.env.CUCUMBER_SET_DEFAULT_TIMEOUT_MS);

BeforeAll(async function () {
  console.info(`\n*** BEGIN SIGNALHUB QA TEST SUITE IN ENV [${nodeEnv}] ***`);
  console.info("Start database connection");
  await connectInterop();
  await connectSignal();
});

Before(async function () {
  // see https://cucumber.io/docs/cucumber/state/?lang=javascript
  await truncateSignalTable();
});

AfterAll(async function () {
  console.info("End database connection");
  await disconnectInterop();
  await disconnectSignal();
  console.info(`*** END SIGNALHUB QA TEST SUITE IN ENV [${nodeEnv}] ***\n`);
});
