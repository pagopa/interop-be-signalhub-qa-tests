import { nodeEnv } from "../configs/env";
import {
  connect,
  disconnect,
  setupConsumerEserviceTable,
  setupEserviceTable,
  truncateConsumerEserviceTable,
  truncateEserviceTable,
} from "../data/db";

(async () => {
  console.info(`\n*** SIGNALHUB DATA PREPARATION IN ENV [${nodeEnv}] ***\n`);
  await connect();
  console.info("Set up database table ESERVICE: truncate and insert");
  await truncateEserviceTable();
  await setupEserviceTable();
  console.info("Set up database table: CONSUMER_ESERVICE: truncate and insert");
  await truncateConsumerEserviceTable();
  await setupConsumerEserviceTable();
})()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    console.info("End database connection");
    await disconnect();
  });
