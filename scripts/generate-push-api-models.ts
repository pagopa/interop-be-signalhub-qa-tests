import path from "path";
import { generateApi } from "swagger-typescript-api";

const openApiSpecificationFileUrl =
  "https://raw.githubusercontent.com/pagopa/interop-signalhub-core/refs/heads/main/docs/openAPI/push-signals_1.0.0.yaml";

const apiFolderPath = path.resolve("./api/");

generateApi({
  extractRequestBody: true,
  extractRequestParams: true,
  fileName: "push-signals.models.ts",
  generateClient: true,
  generateRouteTypes: true,
  generateUnionEnums: true,
  httpClientType: "axios",
  output: apiFolderPath,
  url: openApiSpecificationFileUrl,
}).catch((e) => console.error(e));
