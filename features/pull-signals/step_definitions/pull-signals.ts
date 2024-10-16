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
  "l'utente produttore di segnali, già in possesso di voucher api, ha depositato {int} segnal(e)(i) per l'e-service {string}",
  async function (_howManySignals: number, _eserviceName: string) {
    const signalRequest = createSignal();
    const voucher = await getVoucher();
    const response = await pushSignalApiClient.v1.pushSignal(
      signalRequest,
      getAuthorizationHeader(voucher)
    );
    assertValidResponse(response);

    this.response = response;
    this.requestSignalId = signalRequest.signalId;
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
  async function (_eserviceName: string) {
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
