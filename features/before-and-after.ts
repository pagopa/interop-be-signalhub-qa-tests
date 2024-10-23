import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  setDefaultTimeout,
} from "@cucumber/cucumber";
import { cleanupQAData } from "../data/db";
import { nodeEnv } from "../configs/env";
import { getRandomInt } from "../lib/common";

const PATTERN_FOR_DELETE_ALL_QA_DATA = `QA-%|%`;

// Increase duration of every step with the following timeout (Default is 5000 milliseconds)
setDefaultTimeout(process.env.CUCUMBER_SET_DEFAULT_TIMEOUT_MS);

BeforeAll(async function () {
  console.info(`\n*** BEGIN SIGNALHUB QA TEST SUITE IN ENV [${nodeEnv}] ***`);
});

Before(async function () {
  const seed = `QA-${getRandomInt()}|`;
  this.TEST_SEED = seed;
});

After(async function () {
  const patternToDeleteOnlyDataWithSeed = `${this.TEST_SEED}%`;
  await cleanupQAData(patternToDeleteOnlyDataWithSeed);
});

AfterAll(async function () {
  await cleanupQAData(PATTERN_FOR_DELETE_ALL_QA_DATA);
  console.info(`CLEANING UP ALL QA DATA`);
  console.info(`*** END SIGNALHUB QA TEST SUITE IN ENV [${nodeEnv}] ***\n`);
});
