import { nodeEnv } from "../configs/env";
(async () => {
  console.info(`\n*** SIGNALHUB DATA PREPARATION IN ENV [${nodeEnv}] ***\n`);
})()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    console.info("End database connection");
    process.exit(0);
  });
