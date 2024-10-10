import assert from "assert";
import { Given, Then, When } from "@cucumber/cucumber";
import {
  assertValidResponse,
  createEservice,
  createSignal,
  eserviceIdNotPublished,
  eserviceIdPublishedByAnotherOrganization,
  eserviceIdSecondPushSignals,
  getAuthorizationHeader,
  getRandomSignalId,
  sleep,
} from "../../../lib/common";
import { pushSignalApiClient } from "../../../api/push-signals.client";
import { SignalPayload, SignalType } from "../../../api/push-signals.models";
import { getVoucherApi } from "../../../lib/voucher";

Given(
  "Un utente, come produttore di segnali, ottiene un voucher api",
  async function () {
    const voucher = await getVoucherApi();
    this.voucher = voucher;
  }
);

Given("l'utente deposita un segnale per il primo e-service", async function () {
  const signalRequest = createSignal();

  const response = await pushSignalApiClient.v1.pushSignal(
    signalRequest,
    getAuthorizationHeader(this.voucher)
  );
  assertValidResponse(response);

  this.requestSignalId = signalRequest.signalId;
});

When(
  "l'utente deposita un segnale per il secondo e-service",
  async function () {
    const eserviceId = eserviceIdSecondPushSignals;
    const nextSignalId = (this.requestSignalId as number) + 1;
    const signalRequest = createSignal({
      signalId: nextSignalId,
      eserviceId,
    });

    this.response = await pushSignalApiClient.v1.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
    this.requestSignalId = signalRequest.signalId;
  }
);

When(
  "l'utente deposita un segnale per il secondo e-service con lo stesso signalId del primo",
  async function () {
    const eserviceId = eserviceIdSecondPushSignals;
    const signalRequest = createSignal({
      signalId: this.requestSignalId,
      eserviceId,
    });

    this.response = await pushSignalApiClient.v1.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
    this.requestSignalId = signalRequest.signalId;
  }
);

When(
  "l'utente deposita un segnale con lo stesso signalId del primo",
  async function () {
    await sleep(process.env.WAIT_BEFORE_PUSHING_DUPLICATED_SIGNALID_IN_MS);

    const signalRequest = createSignal({
      signalId: this.requestSignalId,
    });

    this.response = await pushSignalApiClient.v1.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When("l'utente deposita un segnale", async function () {
  const signalRequest = createSignal();

  this.response = await pushSignalApiClient.v1.pushSignal(
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

    this.response = await pushSignalApiClient.v1.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When(
  "l'utente deposita un segnale per un e-service che non è stato pubblicato",
  async function () {
    const eserviceId = eserviceIdNotPublished;
    const signalRequest = createSignal({ eserviceId });

    this.response = await pushSignalApiClient.v1.pushSignal(
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

    this.response = await pushSignalApiClient.v1.pushSignal(
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
      signalId: getRandomSignalId(),
    });

    this.response = await pushSignalApiClient.v1.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );

    this.requestSignalId = signalRequest.signalId;
  }
);

When("l'utente deposita un segnale vuoto", async function () {
  this.response = await pushSignalApiClient.v1.pushSignal(
    {} as SignalPayload,
    getAuthorizationHeader(this.voucher)
  );
});

When(
  "l'utente verifica lo stato del servizio di deposito segnali",
  async function () {
    this.response = await pushSignalApiClient.v1.getStatus(
      getAuthorizationHeader(this.voucher)
    );
  }
);

When(
  "l'utente deposita un segnale per un e-service di cui non è erogatore",
  async function () {
    const eserviceId = eserviceIdPublishedByAnotherOrganization; // e-service id presente in tabella postgres
    const signalRequest = createSignal({
      eserviceId,
    });

    this.response = await pushSignalApiClient.v1.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

Then("la richiesta va a buon fine con status code 200", function () {
  assert.strictEqual(this.response.status, 200);
});

Then(
  "la richiesta va in errore con status code {int}",
  function (statusCode: number) {
    const { errors } = this.response.data;
    assert.strictEqual(this.response.status, statusCode);
    // assertHttpErrorStatusCode(this.response.status, statusCode);
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

Given("Un utente pubblica un e-service con l'opzione utilizzo SH", async () => {
  await createEservice(true);
});

Given("Un utente pubblica un altro e-service con l'opzione utilizzo SH", () => {
  // Write code here that turns the phrase above into concrete actions
});

Given(
  "Un utente, appartenente a un'altra organizzazione, come erogatore pubblica un e-service con il flag utilizzo SH",
  () => {
    // Write code here that turns the phrase above into concrete actions
  }
);

Given(
  "Un utente crea in stato DRAFT un e-service con l'opzione utilizzo SH",
  () => {
    // Write code here that turns the phrase above into concrete actions
  }
);

Given("Un utente pubblica un e-service senza l'opzione utilizzo SH", () => {
  // Write code here that turns the phrase above into concrete actions
});

Given("Un utente modifica l'e-service eliminando l'opzione utilizzo SH", () => {
  // Write code here that turns the phrase above into concrete actions
});
