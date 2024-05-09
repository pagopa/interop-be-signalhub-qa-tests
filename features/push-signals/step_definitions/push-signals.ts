import assert from "assert";
import { Given, Then, When } from "@cucumber/cucumber";
import {
  ESERVICEID_PROVIDED_BY_ANOTHER_ORGANIZATION,
  ESERVICEID_PROVIDED_BY_SAME_ORGANIZATION,
  ESERVICEID_PROVIDED_BY_SAME_ORGANIZATION_NOT_PUBLISHED,
  WAIT_BEFORE_PUSHING_DUPLICATED_SIGNALID_IN_MS,
  assertValidResponse,
  createSignal,
  getAuthorizationHeader,
  getVoucher,
  sleep,
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

Given("l'utente deposita un segnale per il primo e-service", async function () {
  const signalRequest = createSignal();

  const response = await pushSignalApiClient.pushSignal.pushSignal(
    signalRequest,
    getAuthorizationHeader(this.voucher)
  );
  assertValidResponse(response);

  this.requestSignalId = signalRequest.signalId;
});

When(
  "l'utente deposita un segnale per il secondo e-service",
  async function () {
    const eserviceId = ESERVICEID_PROVIDED_BY_SAME_ORGANIZATION;
    const nextSignalId = (this.requestSignalId as number) + 1;
    const signalRequest = createSignal({
      signalId: nextSignalId,
      eserviceId,
    });

    this.response = await pushSignalApiClient.pushSignal.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
    this.requestSignalId = signalRequest.signalId;
  }
);

When(
  "l'utente deposita un segnale per il secondo e-service con lo stesso signalId del primo",
  async function () {
    const eserviceId = ESERVICEID_PROVIDED_BY_SAME_ORGANIZATION;
    const signalRequest = createSignal({
      signalId: this.requestSignalId,
      eserviceId,
    });

    this.response = await pushSignalApiClient.pushSignal.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
    this.requestSignalId = signalRequest.signalId;
  }
);

When(
  "l'utente deposita un segnale con lo stesso signalId del primo",
  async function () {
    await sleep(WAIT_BEFORE_PUSHING_DUPLICATED_SIGNALID_IN_MS);

    const signalRequest = createSignal({
      signalId: this.requestSignalId,
    });

    this.response = await pushSignalApiClient.pushSignal.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When("l'utente deposita un segnale", async function () {
  const signalRequest = createSignal();

  this.response = await pushSignalApiClient.pushSignal.pushSignal(
    signalRequest,
    getAuthorizationHeader(this.voucher)
  );
  this.requestSignalId = signalRequest.signalId;
});

When(
  "l'utente deposita un segnale per un e-service che non esiste",
  async function () {
    const eserviceId = "this-eservice-does-not-exist";
    const signalRequest = createSignal({ eserviceId });

    this.response = await pushSignalApiClient.pushSignal.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When(
  "l'utente deposita un segnale per un e-service che non è stato pubblicato",
  async function () {
    const eserviceId = ESERVICEID_PROVIDED_BY_SAME_ORGANIZATION_NOT_PUBLISHED;
    const signalRequest = createSignal({ eserviceId });

    this.response = await pushSignalApiClient.pushSignal.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When(
  "l'utente deposita un segnale di una tipologia non prevista",
  async function () {
    const signalRequest = createSignal({
      signalType: "TEST" as SignalType,
    });

    this.response = await pushSignalApiClient.pushSignal.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When(
  "l'utente deposita un segnale con tipologia {string}",
  async function (signalType: SignalType) {
    const signalRequest = createSignal({
      signalType,
    });

    this.response = await pushSignalApiClient.pushSignal.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
    this.requestSignalId = signalRequest.signalId;
  }
);

When("l'utente deposita un segnale vuoto", async function () {
  this.response = await pushSignalApiClient.pushSignal.pushSignal(
    {} as SignalRequest,
    getAuthorizationHeader(this.voucher)
  );
});

When(
  "l'utente deposita un segnale per un e-service di cui non è erogatore",
  async function () {
    const eserviceId = ESERVICEID_PROVIDED_BY_ANOTHER_ORGANIZATION; // e-service id presente in tabella postgres
    const signalRequest = createSignal({
      eserviceId,
    });

    this.response = await pushSignalApiClient.pushSignal.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

Then(
  "la richiesta va in errore con status code {int}",
  function (statusCode: number) {
    const { errors } = this.response.data as Problem;
    assert.strictEqual(this.response.status, statusCode);
    assert.ok(errors.length > 0);
  }
);

Then(
  "la richiesta va a buon fine con status code 200 e il segnale viene preso in carico",
  function () {
    const { signalId } = this.response.data;
    assert.strictEqual(signalId, this.requestSignalId);
    assert.strictEqual(this.response.status, 200);
  }
);
