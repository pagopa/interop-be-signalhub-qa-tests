import assert from "assert";
import { Given, Then, When } from "@cucumber/cucumber";
import {
  assertValidResponse,
  createPullSignalRequest,
  createSignal,
  eserviceIdAgreementSuspendedWithConsumer,
  eserviceIdNotAgreementWithConsumer,
  getAuthorizationHeader,
  sleep,
} from "../../../lib/common";
import { pullSignalApiClient } from "../../../api/pull-signal.client";
import { pushSignalApiClient } from "../../../api/push-signals.client";
import { getExpiredVoucher, getVoucherBy } from "../../../lib/voucher";
import { VoucherTypologies } from "../../../lib/voucher.env";

Given("il sistema deposita (il)(i) segnal(e)(i)", async function () {
  // This sleep functioxn simulate the time SQS will take to process the signal and put on DB
  await sleep(10000);
});

Given(
  "un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali",
  async function () {
    const voucher = await getVoucherBy(VoucherTypologies.Enum.PRODUCER);
    this.producerVoucher = voucher;
  }
);

Given(
  "un utente, come consumatore di segnali, ottiene un voucher valido per l'accesso all'e-service lettura segnali",
  async function () {
    const voucher = await getVoucherBy(VoucherTypologies.Enum.CONSUMER);
    this.consumerVoucher = voucher;
  }
);

Given(
  "un utente, come consumatore di segnali, ottiene un voucher valido per un e-service diverso dall'e-service di lettura segnali",
  async function () {
    const voucher = await getVoucherBy(VoucherTypologies.Enum.PRODUCER);
    this.consumerVoucher = voucher;
  }
);

Given(
  "un utente, come consumatore di segnali, ottiene un voucher scaduto per l'accesso all'e-service lettura segnali",
  async function () {
    const expired = await getExpiredVoucher(VoucherTypologies.Enum.CONSUMER);
    this.consumerVoucher = expired;
  }
);

When("l'utente consumatore recupera (un)(i) segnal(e)(i)", async function () {
  // If SignalId is not present in previous given start by signalId = 1
  const signalId = (this.startSignalId || 1) - 1;
  const pullSignalRequest = createPullSignalRequest({
    signalId,
    size: 100,
  });

  this.response = await pullSignalApiClient.signals.pullSignal(
    pullSignalRequest,
    getAuthorizationHeader(this.consumerVoucher)
  );
});

Given(
  "l'utente produttore di segnali deposita {int} segnal(e)(i)",
  async function (signalLength: number) {
    const startSignalId = 1;
    const signalRequest = createSignal({
      signalId: startSignalId,
    });

    const allSignalIdsToPush = Array(signalLength)
      .fill(0)
      .map((_, index) => index + startSignalId);
    const pushASignal = async (signalId: number) => {
      const response = await pushSignalApiClient.signals.pushSignal(
        {
          ...signalRequest,
          signalId,
        },
        getAuthorizationHeader(this.producerVoucher)
      );
      assertValidResponse(response);
    };
    await Promise.all(allSignalIdsToPush.map(pushASignal));

    this.startSignalId = startSignalId;
  }
);

When(
  "l'utente consumatore recupera un segnale per un e-service con cui non ha una richiesta di fruizione",
  async function () {
    const pullSignalRequest = createPullSignalRequest({
      eserviceId: eserviceIdNotAgreementWithConsumer,
    });

    this.response = await pullSignalApiClient.signals.pullSignal(
      pullSignalRequest,
      getAuthorizationHeader(this.consumerVoucher)
    );
  }
);

When(
  "l'utente consumatore recupera un segnale per un e-service con cui ha una richiesta di fruizone in stato diverso da ACTIVE",
  async function () {
    const pullSignalRequest = createPullSignalRequest({
      eserviceId: eserviceIdAgreementSuspendedWithConsumer,
    });

    this.response = await pullSignalApiClient.signals.pullSignal(
      pullSignalRequest,
      getAuthorizationHeader(this.consumerVoucher)
    );
  }
);

When(
  "l'utente consumatore recupera un segnale inserendo un signalId uguale a {int}",
  async function (startSignalId: number) {
    const pullSignalRequest = createPullSignalRequest({
      signalId: startSignalId,
    });

    this.response = await pullSignalApiClient.signals.pullSignal(
      pullSignalRequest,
      getAuthorizationHeader(this.consumerVoucher)
    );
  }
);

Then(
  "la richiesta va a buon fine con status code {int} e restituisce una lista di {int} segnal(e)(i)",
  function (statusCode: number, numberOfSignalList: number) {
    const data = this.response.data;

    assert.strictEqual(data.signals?.length, numberOfSignalList);
    assert.strictEqual(this.response.status, statusCode);
  }
);

Then(
  "la richiesta va a buon fine con status code {int} e restituisce una lista di {int} segnal(e)(i) e lastSignalId = {int}",
  function (statusCode: number, signalsLength: number, lastSignalId: number) {
    const data = this.response.data;

    assert.strictEqual(data.signals?.length, signalsLength);
    assert.strictEqual(data.lastSignalId, lastSignalId);
    assert.strictEqual(this.response.status, statusCode);
  }
);

Then(
  "la richiesta va a buon fine con status code {int} e restituisce una lista di {int} segnal(e)(i) e nessun lastSignalId",
  function (statusCode: number, numberOfSignalList: number) {
    const data = this.response.data;

    assert.strictEqual(data.signals?.length, numberOfSignalList);
    assert.strictEqual(data.lastSignalId, null);
    assert.strictEqual(this.response.status, statusCode);
  }
);
