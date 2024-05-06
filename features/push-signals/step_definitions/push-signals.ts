import assert from "assert";
import { Given, Then, When } from "@cucumber/cucumber";
import { getVoucher } from "../../../utils/common";
import {
  Configuration,
  GatewayApiFactory,
  SignalRequest,
} from "../../../api/push";

Given(
  "Un utente, come produttore di segnali, ottiene un voucher valido per l’accesso all'e-service deposito segnali",
  async function () {
    const voucher = await getVoucher();
    this.voucher = voucher;
  }
);

When(
  "l'utente deposita {int} segnal(e)(i)",
  async function (_howManySignals: number) {
    // Write code here that turns the phrase above into concrete actions
    const signal: SignalRequest = {
      objectId: "on3ueZN9YC1Ew8c6RAuYC",
      signalType: "CREATE",
      eserviceId: "16d64180-e352-442e-8a91-3b2ae77ca1df",
      objectType: "FX65ZU937QLm6iPwIzlt4",
      signalId: 1,
    };
    const conf: Configuration = {
      basePath: process.env.API_BASE_PATH,
      isJsonMime: () => true,
      baseOptions: {
        headers: {
          Authorization: `Bearer ${this.voucher}`,
        },
        timeout: 60000,
      },
    };
    const apiClient = GatewayApiFactory(conf);
    try {
      const response = await apiClient.pushSignal(signal);
      console.log(response.data);
      const { signalId } = response.data;
      this.signalId = signalId;
      this.status = response.status;
    } catch (e: unknown) {
      // Deal with the fact the chain failed
      // console.log("DUMP", e.response.data);
    }
  }
);

Then(
  "l'e-service deposito segnali riceve la richiesta e la prende in carico correttamente",
  function () {
    // Write code here that turns the phrase above into concrete actions
    assert.strictEqual(this.signalId, 1);
  }
);
Then("restituisce status code {int}", function (_statusCode: number) {
  // Write code here that turns the phrase above into concrete actions
  assert.strictEqual(this.status, 200);
});
