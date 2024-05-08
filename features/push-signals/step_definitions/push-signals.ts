import assert from "assert";
import { Given, Then, When } from "@cucumber/cucumber";
import {
  createSignal,
  getAuthorizationHeader,
  getVoucher,
} from "../../../utils/common";
import { pushSignalApiClient } from "../../../api/push-signals.client";
import { AxiosResponse } from "axios";
import { Signal, SignalRequest } from "../../../api/push-signals.models";

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
    const signalRequest = createSignal();

    let response: AxiosResponse<Signal>;
    for (let i = 0; i <= _howManySignals; i++) {
      response = await pushSignalApiClient.pushSignal.pushSignal(
        signalRequest,
        getAuthorizationHeader(this.voucher)
      );
    }

    console.log("response:", response!);
    const { signalId } = response!.data;
    this.signalId = signalId;
    this.status = response!.status;
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
  assert.strictEqual(this.status, _statusCode);
});
