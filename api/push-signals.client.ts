import { Api } from "./push-signals.models";

export const pushSignalApiClient = new Api({
  baseURL: `${process.env.API_BASE_PATH}:${process.env.PUSH_SERVICE_PORT}`,

  headers: {
    "X-correlation-Id": "push-signal_test",
  },
  timeout: 60000,
  validateStatus: () => true,
});
