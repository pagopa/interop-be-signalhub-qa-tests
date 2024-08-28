import { nodeEnv } from "../configs/env";
import {
  connectInterop,
  setupAgreementTable,
  setupEserviceTable,
  setupPurposeTable,
} from "../data/db";

(async () => {
  console.info(`\n*** SIGNALHUB DATA PREPARATION IN ENV [${nodeEnv}] ***\n`);
  await connectInterop();
  console.info("Set up database table ESERVICE: insert data");
  // await truncateEserviceTable();
  await setupEserviceTable();
  console.info("Set up database table: AGREEMENT: insert data");
  // await truncateAgreementTable();
  await setupAgreementTable();
  console.info("Set up database table: PURPOSE: insert data");
  await setupPurposeTable();
})()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    console.info("End database connection");
    process.exit(0);
  });
