import path from "path";
import { generateApi } from "swagger-typescript-api";

const openApiSpecificationFileUrl =
  "https://raw.githubusercontent.com/pagopa/interop-signalhub-core/479f5ece75750e9bac87826727913b956d865365/packages/pull-signal/src/api/pull-signals_1.2.0_.yaml";

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
