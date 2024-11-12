import path from "path";
import { generateApi } from "swagger-typescript-api";

const openApiSpecificationFileUrl =
  "https://raw.githubusercontent.com/pagopa/interop-signalhub-core/refs/heads/main/docs/openAPI/pull-signals_1.0.0.yaml";

const apiFolderPath = path.resolve("./api/");

generateApi({
  name: "pull-signals.models.ts",
  url: openApiSpecificationFileUrl,
  output: apiFolderPath,
  generateClient: true,
  httpClientType: "axios",
  generateUnionEnums: true,
  extractRequestParams: true,
  extractRequestBody: true,
  generateRouteTypes: true,
}).catch((e) => console.error(e));
