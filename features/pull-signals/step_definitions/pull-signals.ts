/* eslint-disable arrow-body-style */
import assert from "assert";
import { Given, Then, When } from "@cucumber/cucumber";
import {
  assertValidResponse,
  createAgreement,
  createEservice,
  createPullSignalRequest,
  createPurpose,
  createSignal,
  getAgreement,
  getAuthorizationHeader,
  getConsumerOrganization,
  getEservice,
  getProducerOrganization,
  getPurpose,
  sleep,
} from "../../../lib/common";
import { pullSignalApiClient } from "../../../api/pull-signal.client";
import { pushSignalApiClient } from "../../../api/push-signals.client";
import { getExpiredVoucher, getVoucher } from "../../../lib/voucher";

Given(
  "l'ente {string}, aderente a PDND Interop, è erogatore dell'e-service e produttore dei segnali",
  function (_organizationName: string) {
    this.signalProducerId = getProducerOrganization();
  }
);

Given(
  "l'ente {string}, aderente a PDND Interop, è fruitore e consumatore dei segnali",
  function (_organizationName: string) {
    this.signalConsumerId = getConsumerOrganization();
  }
);

Given(
  "l'ente erogatore ha pubblicato un e-service denominato {string} abilitato a Signal Hub",
  async function (eserviceName: string) {
    const eServiceProducer = getEservice(eserviceName);
    const { name, id, descriptor, state, enable_signal_hub } = eServiceProducer;
    await createEservice({
      producerId: this.signalProducerId,
      descriptorId: descriptor,
      eServiceId: id,
      state,
      isEnabledToSH: enable_signal_hub,
      name,
    });

    this.eserviceId = id;
  }
);

Given(
  "l'utente consumatore di segnali ha ottenuto un voucher api",
  async function () {
    const voucher = await getVoucher({
      ORGANIZATION_ID: this.signalConsumerId,
    });
    this.voucher = voucher;
  }
);

Given("il sistema ha depositato (il)(i) segnal(e)(i)", async function () {
  // This sleep function simulate the time SQS will take to process the signal and put on DB
  await sleep(10000);
});

Given(
  "l'utente produttore di segnali, già in possesso di voucher api, ha depositato {int} segnal(e)(i) per l'e-service {string}",
  async function (signalLength: number, eserviceName: string) {
    const voucher = await getVoucher();
    const eservice = getEservice(eserviceName);
    const startSignalId = 1;
    const signalRequest = createSignal({
      signalId: startSignalId,
      eserviceId: eservice.id,
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
        getAuthorizationHeader(voucher)
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
    const organization = this.signalConsumerId;
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
    const organization = this.signalConsumerId;
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
  async function (eserviceName: string) {
    const { id } = getEservice(eserviceName);
    // If SignalId is not present in previous given start by signalId = 1
    const signalId = (this.startSignalId || 1) - 1;
    const pullSignalRequest = createPullSignalRequest({
      eserviceId: id,
      signalId,
      size: 10,
    });

    this.response = await pullSignalApiClient.v1.pullSignal(
      pullSignalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When(
  "l'utente recupera un segnale dell'e-service {string} con un signalId uguale a {int}",
  async function (serviceName: string, startSignalId: number) {
    const eservice = getEservice(serviceName);
    const pullSignalRequest = createPullSignalRequest({
      signalId: startSignalId,
      eserviceId: eservice.id,
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
  function (
    statusCode: number,
    signalsLength: number,
    lastSignalId: number | null
  ) {
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
