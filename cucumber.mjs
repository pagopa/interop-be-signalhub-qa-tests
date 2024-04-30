/* Run tests in parallel with the given number of worker processes */
export const parallel = {
  parallel: Number(process.env.CUCUMBER_OPTS_PARALLEL) || 1,
};

export const format = {
  format: ["progress-bar"],
  formatOptions: { snippetInterface: "synchronous" },
};

export const base = {
  ...parallel,
  ...format,
};

export const validate = {
  dryRun: true,
};

export const node = {
  requireModule: ["ts-node/register"],
};

export const all = {
  paths: ["features/**/*.feature"],
  require: ["./features/**/step_definitions/**/*.ts"],
};

//TODO: Add different profile based on Push-service and pull-service

export default {};
