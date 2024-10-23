import {
  AfterAll,
  Before,
  BeforeAll,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import { cleanupQAData } from "../data/db";
import { nodeEnv } from "../configs/env";
import { getRandomInt } from "../lib/common";

const PATTERN_FOR_DELETE_QA_DATA = `QA-%|%`;

// Increase duration of every step with the following timeout (Default is 5000 milliseconds)
setDefaultTimeout(process.env.CUCUMBER_SET_DEFAULT_TIMEOUT_MS);

BeforeAll(async function () {
  console.info(`\n*** BEGIN SIGNALHUB QA TEST SUITE IN ENV [${nodeEnv}] ***`);
});

// see https://cucumber.io/docs/cucumber/state/?lang=javascript
Before(async function () {
  await cleanupQAData(PATTERN_FOR_DELETE_QA_DATA);
  const seed = `QA-${getRandomInt()}|`;
  this.TEST_SEED = seed;
});

AfterAll(async function () {
  await cleanupQAData(PATTERN_FOR_DELETE_QA_DATA);
  console.info(`CLEANING UP ALL QA DATA`);
  console.info(`*** END SIGNALHUB QA TEST SUITE IN ENV [${nodeEnv}] ***\n`);
});
