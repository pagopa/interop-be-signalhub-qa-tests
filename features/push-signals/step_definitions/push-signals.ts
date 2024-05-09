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
    const eserviceId = "3a023c23b-7662-4971-994e-0eb9adabc728";
    const nextSignalId = (this.requestSignalId as number) + 1;
    const signalRequest = createSignal({
      signalId: nextSignalId,
      eserviceId,
    });

    const response = await pushSignalApiClient.pushSignal.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
    assertValidResponse(response);

    const { signalId } = response.data;
    this.requestSignalId = signalRequest.signalId;
    this.responseSignalId = signalId;
    this.status = response.status;
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

    const response = await pushSignalApiClient.pushSignal.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
    assertValidResponse(response);

    const { signalId } = response.data;
    this.requestSignalId = signalRequest.signalId;
    this.responseSignalId = signalId;
    this.status = response.status;
  }
);

When(
  "l'utente deposita un segnale con lo stesso signalId del primo",
  async function () {
    await sleep(WAIT_BEFORE_PUSHING_DUPLICATED_SIGNALID_IN_MS);

    const signalRequest = createSignal({
      signalId: this.requestSignalId,
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

When("l'utente deposita un segnale", async function () {
  const signalRequest = createSignal();

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
  "l'utente deposita un segnale per un e-service che non esiste",
  async function () {
    const eserviceId = "this-eservice-does-not-exist";
    const signalRequest = createSignal({ eserviceId });

    const response = await pushSignalApiClient.pushSignal.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );

    const { errors } = response.data as Problem;
    this.errors = errors;
    this.status = response.status;
  }
);

When(
  "l'utente deposita un segnale per un e-service che non è stato pubblicato",
  async function () {
    const eserviceId = ESERVICEID_PROVIDED_BY_SAME_ORGANIZATION_NOT_PUBLISHED;
    const signalRequest = createSignal({ eserviceId });

    const response = await pushSignalApiClient.pushSignal.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );

    const { errors } = response.data as Problem;
    this.errors = errors;
    this.status = response.status;
  }
);

When(
  "l'utente deposita un segnale di una tipologia non prevista",
  async function () {
    const signalRequest = createSignal({
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

When(
  "l'utente deposita un segnale con tipologia {string}",
  async function (signalType: SignalType) {
    const signalRequest = createSignal({
      signalType,
    });

    const response = await pushSignalApiClient.pushSignal.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
    const { signalId } = response.data;
    this.requestSignalId = signalRequest.signalId;
    this.responseSignalId = signalId;
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

Then(
  "la richiesta non va a buon fine con status code {int}",
  function (statusCode: number) {
    assert.strictEqual(this.status, statusCode);
    assert.ok(this.errors.length > 0);
  }
);

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

When(
  "l'utente deposita un segnale per un e-service di cui non è erogatore",
  async function () {
    const eserviceId = ESERVICEID_PROVIDED_BY_ANOTHER_ORGANIZATION; // e-service id presente in tabella postgres
    const signalRequest = createSignal({
      eserviceId,
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
