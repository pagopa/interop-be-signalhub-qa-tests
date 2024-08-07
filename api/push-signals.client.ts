import { Api } from "./push-signals.models";

export const pushSignalApiClient = new Api({
  baseURL: process.env.API_BASE_URL_PUSH,

  headers: {
    "X-correlation-Id": "push-signal-qa-test",
  },
  timeout: 60000,
  validateStatus: () => true,
});
