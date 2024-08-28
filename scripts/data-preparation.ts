import { nodeEnv } from "../configs/env";
import {
  setupAgreementTable,
  setupEserviceTable,
  setupPurposeTable,
} from "../data/db.data.preparation";

(async () => {
  console.info(`\n*** SIGNALHUB DATA PREPARATION IN ENV [${nodeEnv}] ***\n`);

  console.info("Set up database table ESERVICE: insert data");
  await setupEserviceTable();
  console.info("Set up database table: AGREEMENT: insert data");
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
