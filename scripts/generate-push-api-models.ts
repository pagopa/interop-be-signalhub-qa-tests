import path from "path";
import { generateApi } from "swagger-typescript-api";

const openApiSpecificationFileUrl =
  "https://raw.githubusercontent.com/pagopa/interop-signalhub-core/refs/heads/main/packages/push-signal/src/api/push-signals_1.1.0.yaml";

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
