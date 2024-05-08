import assert from "assert";
import { Given, Then, When } from "@cucumber/cucumber";
import {
  createSignal,
  getAuthorizationHeader,
  getVoucher,
} from "../../../utils/common";
import { pushSignalApiClient } from "../../../api/push-signals.client";
import {
  Problem,
  SignalRequest,
  SignalType,
} from "../../../api/push-signals.models";

Given(
  "Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali",
  async function () {
    const voucher = await getVoucher();
    this.voucher = voucher;
  }
);

Given(
  "Un utente, come produttore di segnali, ottiene un voucher valido per un e-service diverso dall'e-service di deposito segnali",
  async function () {
    const voucher = await getVoucher({
      purposeId: process.env.FAKE_PURPOSE_ID,
    });
    this.voucher = voucher;
  }
);

When("l'utente deposita un segnale", async function () {
  const signalRequest = createSignal({ signalId: 1 });

  const response = await pushSignalApiClient.pushSignal.pushSignal(
    signalRequest,
    getAuthorizationHeader(this.voucher)
  );

  const { signalId } = response.data;
  this.requestSignalId = signalRequest.signalId;
  this.responseSignalId = signalId;
  this.status = response.status;
});

When(
  "l'utente deposita un segnale di una tipologia non prevista",
  async function () {
    const signalRequest = createSignal({
      signalId: 1,
      signalType: "TEST" as SignalType,
    });

    const response = await pushSignalApiClient.pushSignal.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );

    const { errors } = response.data as Problem;
    this.errors = errors;
    this.status = response.status;
  }
);

When("l'utente deposita un segnale vuoto", async function () {
  const response = await pushSignalApiClient.pushSignal.pushSignal(
    {} as SignalRequest,
    getAuthorizationHeader(this.voucher)
  );

  const { errors } = response.data as Problem;
  this.errors = errors;
  this.status = response.status;
});

Then("la richiesta non va a buon fine", function () {
  assert.strictEqual(this.status, 400);
  assert.ok(this.errors.length > 0);
});

Then(
  "l'e-service deposito segnali restituisce status code 200 e prende in carico la richiesta",
  function () {
    assert.strictEqual(this.responseSignalId, this.requestSignalId);
    assert.strictEqual(this.status, 200);
  }
);

Then(
  "l'e-service deposito segnali restituisce status code {int}",
  function (httpStatusCode: number) {
    assert.strictEqual(this.status, httpStatusCode);
  }
);
