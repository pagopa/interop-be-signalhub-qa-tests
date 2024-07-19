import { nodeEnv } from "../configs/env";
import {
  connectInterop,
  disconnectInterop,
  setupAgreementTable,
  setupEserviceTable,
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
})()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    console.info("End database connection");
    await disconnectInterop();
  });
