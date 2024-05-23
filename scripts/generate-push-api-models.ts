import path from "path";
import { generateApi } from "swagger-typescript-api";

const openApiSpecificationFileUrl =
  "https://raw.githubusercontent.com/pagopa/interop-be-signalhub-push-service/feature/poc/docs/openapi/push-signal_v1_sync.yaml";

const apiFolderPath = path.resolve("./api/");

generateApi({
  name: "push-signals.models.ts",
  url: openApiSpecificationFileUrl,
  output: apiFolderPath,
  generateClient: true,
  httpClientType: "axios",
  generateUnionEnums: true,
  extractRequestParams: true,
  extractRequestBody: true,
  generateRouteTypes: true,
}).catch((e) => console.error(e));
