import assert from "assert";
import { Given, Then, When } from "@cucumber/cucumber";
import {
  assertValidResponse,
  createSignal,
  eserviceIdNotPublished,
  eserviceIdPublishedByAnotherOrganization,
  eserviceIdSecondPushSignals,
  getAuthorizationHeader,
  getRandomSignalId,
  purposeIdDifferentFromEservicePushSignals,
  sleep,
} from "../../../lib/common";
import { pushSignalApiClient } from "../../../api/push-signals.client";
import { PushSignalPayload as SignalRequest } from "../../../api/push-signals.models";
import { getVoucherBy } from "../../../lib/voucher";
import { VoucherTypologies } from "../../../lib/voucher.env";
import { SignalType } from "../../../lib/types";

Given(
  "Un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali",
  async function () {
    const voucher = await getVoucherBy(VoucherTypologies.Enum.PRODUCER);
    this.voucher = voucher;
  }
);

Given(
  "Un utente, come produttore di segnali, ma come fruitore di un altro e-service, ottiene un voucher valido per un e-service diverso dall'e-service di deposito segnali",
  async function () {
    const voucher = await getVoucherBy(VoucherTypologies.Enum.PRODUCER, {
      PURPOSE_ID: purposeIdDifferentFromEservicePushSignals,
      AUDIENCE: "some-wrong-audience",
    });
    this.voucher = voucher;
  }
);

Given("l'utente deposita un segnale per il primo e-service", async function () {
  const signalRequest = createSignal();

  const response = await pushSignalApiClient.signals.pushSignal(
    signalRequest,
    getAuthorizationHeader(this.voucher)
  );
  assertValidResponse(response);

  this.requestSignalId = signalRequest.signalId;
});

// When("l'utente verifica lo stato del servizio" , async function () {

//   this.response = await pushSignalApiClient.
// })

When(
  "l'utente deposita un segnale per il secondo e-service",
  async function () {
    const eserviceId = eserviceIdSecondPushSignals;
    const nextSignalId = (this.requestSignalId as number) + 1;
    const signalRequest = createSignal({
      signalId: nextSignalId,
      eserviceId,
    });

    this.response = await pushSignalApiClient.signals.pushSignal(
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

    this.response = await pushSignalApiClient.signals.pushSignal(
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

    this.response = await pushSignalApiClient.signals.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When("l'utente deposita un segnale", async function () {
  const signalRequest = createSignal();

  this.response = await pushSignalApiClient.signals.pushSignal(
    signalRequest,
    getAuthorizationHeader(this.voucher)
  );

  this.requestSignalId = signalRequest.signalId;
});

// When(
//   "l'utente deposita un segnale specifico per un consumer",
//   async function () {
//     const signalRequest = createSignalConsumers();
//     this.response = await pushSignalApiClient.signals.pushSignalList(
//       signalRequest,
//       getAuthorizationHeader(this.voucher)
//     );
//     this.requestSignalId = signalRequest.signalId;
//   }
// );

When(
  "l'utente deposita un segnale per un e-service che non esiste",
  async function () {
    const eserviceId = "this-eservice-does-not-exist";
    const signalRequest = createSignal({ eserviceId });

    this.response = await pushSignalApiClient.signals.pushSignal(
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

    this.response = await pushSignalApiClient.signals.pushSignal(
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

    this.response = await pushSignalApiClient.signals.pushSignal(
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

    this.response = await pushSignalApiClient.signals.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );

    this.requestSignalId = signalRequest.signalId;
  }
);

When("l'utente deposita un segnale vuoto", async function () {
  this.response = await pushSignalApiClient.signals.pushSignal(
    {} as SignalRequest,
    getAuthorizationHeader(this.voucher)
  );
});

When(
  "l'utente deposita un segnale per un e-service di cui non è erogatore",
  async function () {
    const eserviceId = eserviceIdPublishedByAnotherOrganization; // e-service id presente in tabella postgres
    const signalRequest = createSignal({
      eserviceId,
    });

    this.response = await pushSignalApiClient.signals.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

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
