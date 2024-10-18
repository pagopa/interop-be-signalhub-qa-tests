import {
  AfterAll,
  Before,
  BeforeAll,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import { truncateSignalTable, connectSignal } from "../data/db";
import { nodeEnv } from "../configs/env";
import { getRandomInt } from "../lib/common";

// Increase duration of every step with the following timeout (Default is 5000 milliseconds)
setDefaultTimeout(process.env.CUCUMBER_SET_DEFAULT_TIMEOUT_MS);

BeforeAll(async function () {
  console.info(`\n*** BEGIN SIGNALHUB QA TEST SUITE IN ENV [${nodeEnv}] ***`);
  console.info("Start database connection");
  await connectSignal();
});

Before(async function () {
  this.TEST_SEED = `QA-${getRandomInt()}/`;
  // see https://cucumber.io/docs/cucumber/state/?lang=javascript
  await truncateSignalTable();
});

AfterAll(async function () {
  console.info("End database connection");
  console.info(`*** END SIGNALHUB QA TEST SUITE IN ENV [${nodeEnv}] ***\n`);
});
