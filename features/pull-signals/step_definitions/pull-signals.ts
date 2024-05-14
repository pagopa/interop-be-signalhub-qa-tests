import assert from "assert";
import { Given, Then, When } from "@cucumber/cucumber";
import {
  ESERVICEID_PROVIDED_BY_SAME_ORGANIZATION,
  assertValidResponse,
  createPullSignalRequest,
  createSignal,
  getAuthorizationHeader,
  getVoucherBy,
  sleep,
} from "../../../utils/common";
import { pullSignalApiClient } from "../../../api/pull-signal.client";
import { pushSignalApiClient } from "../../../api/push-signals.client";
import { PaginationSignal } from "../../../api/pull-signals.models";

Given(
  "un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali",
  async function () {
    const voucher = await getVoucherBy("PRODUCER");
    this.producerVoucher = voucher;
  }
);

Given(
  "un utente, come consumatore di segnali, ottiene un voucher valido per l'accesso all'e-service lettura segnali",
  async function () {
    const voucher = await getVoucherBy("CONSUMER");
    this.consumerVoucher = voucher;
  }
);

Given(
  "un utente, come consumatore di segnali, ottiene un voucher valido per un e-service diverso dall'e-service di lettura segnali",
  async function () {
    const voucher = await getVoucherBy("PRODUCER");
    this.consumerVoucher = voucher;
  }
);

Given(
  "un utente, come consumatore di segnali, ottiene un voucher scaduto per l'accesso all'e-service lettura segnali",
  async function () {
    this.consumerVoucher = process.env.EXPIRED_TOKEN;
  }
);

When("l'utente consumatore recupera (un)(i) segnal(e)(i)", async function () {
  // If SignalId is not present in previous given start by signalId = 1
  const signalId = (this.lastSignalId || 1) - 1;
  const pullSignalRequest = createPullSignalRequest({
    signalId,
  });

  this.response = await pullSignalApiClient.pullSignal.getRequest(
    pullSignalRequest,
    getAuthorizationHeader(this.consumerVoucher)
  );
});

When(
  "l'utente consumatore recupera un segnale per un e-service con cui non ha una richiesta di fruizione",
  async function () {
    const pullSignalRequest = createPullSignalRequest({
      eserviceId: ESERVICEID_PROVIDED_BY_SAME_ORGANIZATION,
    });

    this.response = await pullSignalApiClient.pullSignal.getRequest(
      pullSignalRequest,
      getAuthorizationHeader(this.consumerVoucher)
    );
  }
);

Given(
  "l'utente produttore di segnali deposita {int} segnal(e)(i)",
  async function (signalLength: number) {
    const startSignalId = 1;
    const signalRequest = createSignal({
      signalId: startSignalId,
    });
    let signalId = startSignalId;
    for (let i = startSignalId; i <= signalLength; i++) {
      signalId = i;
      this.response = await pushSignalApiClient.pushSignal.pushSignal(
        {
          ...signalRequest,
          signalId,
        },
        getAuthorizationHeader(this.producerVoucher)
      );

      assertValidResponse(this.response);
    }
    this.lastSignalId = startSignalId;
  }
);

Then(
  "la richiesta va a buon fine con status code {int} e restituisce una lista di {int} segnal(e)(i)",
  function (statusCode: number, numberOfSignalList: number) {
    const data = this.response.data.signals;

    assert.strictEqual(data.length, numberOfSignalList);
    assert.strictEqual(this.response.status, statusCode);
  }
);

Then(
  "la richiesta va a buon fine con status code {int} e restituisce una lista di {int} segnal(e)(i) e lastSignalId = {int}",
  function (statusCode: number, signalsLength: number, lastSignalId: number) {
    const data: PaginationSignal = this.response.data;

    assert.strictEqual(data.signals?.length, signalsLength);
    assert.strictEqual(data.lastSignalId, lastSignalId);
    assert.strictEqual(this.response.status, statusCode);
  }
);

Then(
  "la richiesta va a buon fine con status code {int} e restituisce una lista di {int} segnal(e)(i) e nessun lastSignalId",
  function (statusCode: number, numberOfSignalList: number) {
    const data: PaginationSignal = this.response.data;

    assert.strictEqual(data.signals?.length, numberOfSignalList);
    assert.strictEqual(data.lastSignalId, null);
    assert.strictEqual(this.response.status, statusCode);
  }
);

When(
  "l'utente consumatore recupera un segnale inserendo un signalId uguale a {int}",
  async function (startSignalId: number) {
    const pullSignalRequest = createPullSignalRequest({
      signalId: startSignalId,
    });

    this.response = await pullSignalApiClient.pullSignal.getRequest(
      pullSignalRequest,
      getAuthorizationHeader(this.consumerVoucher)
    );
  }
);

Given("il sistema deposita (il)(i) segnal(e)(i)", async function () {
  // This sleep function simulate the time SQS will take to process the signal and put on DB
  await sleep(5000);
});
