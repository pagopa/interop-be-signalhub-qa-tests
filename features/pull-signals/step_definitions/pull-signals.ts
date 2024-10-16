import assert from "assert";
import { Given, Then, When } from "@cucumber/cucumber";
import {
  assertValidResponse,
  createAgreement,
  createPullSignalRequest,
  createPurpose,
  createSignal,
  getAgreement,
  getAuthorizationHeader,
  getConsumerOrganization,
  getPurpose,
  sleep,
} from "../../../lib/common";
import { pullSignalApiClient } from "../../../api/pull-signal.client";
import { pushSignalApiClient } from "../../../api/push-signals.client";
import { getExpiredVoucher, getVoucher } from "../../../lib/voucher";

Given("il sistema ha depositato (il)(i) segnal(e)(i)", async function () {
  // This sleep function simulate the time SQS will take to process the signal and put on DB
  await sleep(10000);
});

Given(
  "un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali",
  async function () {
    const voucher = await getVoucher();
    this.producerVoucher = voucher;
  }
);

Given(
  "un utente, come consumatore di segnali, ottiene un voucher valido per l'accesso all'e-service lettura segnali",
  async function () {
    const voucher = await getVoucher();
    this.consumerVoucher = voucher;
  }
);

Given(
  "un utente, come consumatore di segnali, ottiene un voucher valido per un e-service diverso dall'e-service di lettura segnali",
  async function () {
    const voucher = await getVoucher();
    this.consumerVoucher = voucher;
  }
);

Given(
  "un utente, come consumatore di segnali, ottiene un voucher scaduto per l'accesso all'e-service lettura segnali",
  async function () {
    const expired = await getExpiredVoucher();
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

  this.response = await pullSignalApiClient.v1.pullSignal(
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
      const response = await pushSignalApiClient.v1.pushSignal(
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

Given(
  "l'utente consumatore di segnali ha ottenuto un voucher api scaduto",
  async function () {
    const voucherExpired = await getExpiredVoucher();
    this.voucher = voucherExpired;
  }
);

Given(
  "l'utente ha già una richiesta di fruizione in stato {string} per l'e-service {string}",
  async function (agreementStatus: string, eserviceName: string) {
    const organization = getConsumerOrganization();
    const agreement = getAgreement(eserviceName);
    return await createAgreement(
      {
        ...agreement,
        ...{ state: agreementStatus },
      },
      organization
    );
  }
);

Given(
  "l'utente ha già una finalità in stato {string} per l'e-service {string}",
  async function (purposeStatus: string, eserviceName: string) {
    const organization = getConsumerOrganization();
    const purpose = getPurpose(eserviceName);
    return await createPurpose(
      {
        ...purpose,
        ...{ state: purposeStatus },
      },
      organization
    );
  }
);

When(
  "l'utente recupera (un)(i) segnal(e)(i) dell'e-service {string}",
  async function () {
    // If SignalId is not present in previous given start by signalId = 1
    const signalId = (this.startSignalId || 1) - 1;
    const pullSignalRequest = createPullSignalRequest({
      signalId,
      size: 100,
    });

    this.response = await pullSignalApiClient.v1.pullSignal(
      pullSignalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When(
  "l'utente recupera un segnale dell'e-service {string} con un signalId uguale a {int}",
  async function (startSignalId: number) {
    const pullSignalRequest = createPullSignalRequest({
      signalId: startSignalId,
    });

    this.response = await pullSignalApiClient.v1.pullSignal(
      pullSignalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When(
  "l'utente verifica lo stato del servizio di recupero segnali",
  async function () {
    this.response = await pullSignalApiClient.v1.getStatus(
      getAuthorizationHeader(this.voucher)
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
