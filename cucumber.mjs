import dotenv from "dotenv";
const nodeEnv = process.env.NODE_ENV || "personal";
dotenv.config({ path: `.env.${nodeEnv}` });

/* Run tests in parallel with the given number of worker processes */
export const parallel = {
  parallel: Number(process.env.CUCUMBER_OPTS_PARALLEL),
};

export const format = {
  format: ["progress-bar"],
  formatOptions: { snippetInterface: "synchronous" },
};

export const base = {
  ...parallel,
  ...format,
  worldParameters: { signalIdCounter: 0 },
};

export const validate = {
  dryRun: true,
};

export const node = {
  requireModule: ["ts-node/register"],
};

export const all = {
  paths: ["features/**/*.feature"],
  require: ["./features/**/step_definitions/**/*.ts", "./features/*.ts"],
};

// TODO: Add different profile based on Push-service and pull-service

export default {};
