import { Api } from "./pull-signals.models";

export const pullSignalApiClient = new Api({
  baseURL: `${process.env.API_BASE_PATH}:${process.env.PULL_SERVICE_PORT}`,
  headers: {
    "X-correlation-Id": "pull-signal-test",
  },
  timeout: 60000,
  validateStatus: () => true,
});
