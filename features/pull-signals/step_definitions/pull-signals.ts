import { Given, Then, When } from "@cucumber/cucumber";
import assert from "assert";

import { pullSignalApiClient } from "../../../api/pull-signal.client";
import { pushSignalApiClient } from "../../../api/push-signals.client";
import {
  assertValidResponse,
  createOrUpdateAgreement,
  createOrUpdatePurpose,
  createPullSignalRequest,
  createSignal,
  getAuthorizationHeader,
  sleep,
} from "../../../lib/common";
import {
  getAgreementBy,
  getEserviceBy,
  getOrganizationByName,
  getPurposeBy,
} from "../../../lib/data.interop";
import { getExpiredVoucher, getVoucher } from "../../../lib/voucher";

Given(
  "l'ente {string}, aderente a PDND Interop, è fruitore e consumatore dei segnali",
  function (organizationName: string) {
    const organization = getOrganizationByName(organizationName);
    this.consumerId = organization.id;
  },
);

Given(
  "l'utente consumatore di segnali ha ottenuto un voucher api",
  async function () {
    const voucher = await getVoucher({
      ORGANIZATION_ID: this.consumerId,
    });
    this.voucher = voucher;
  },
);

Given("il sistema ha depositato (il)(i) segnal(e)(i)", async function () {
  // This sleep function simulate the time SQS will take to process the signal and put on DB
  await sleep(process.env.TIME_SIMULATE_SQS_QUEUE_TO_DEPOSIT_SIGNAL_IN_MS);
});

Given(
  "l'utente produttore di segnali, già in possesso di voucher api, ha depositato {int} segnal(e)(i) per quell'e-service",
  async function (signalLength: number) {
    const voucher = await getVoucher({
      ORGANIZATION_ID: this.producerId,
    });
    const startSignalId = 1;
    const signalRequest = createSignal({
      eserviceId: this.eserviceId,
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
        getAuthorizationHeader(voucher),
      );
      assertValidResponse(response);
    };
    await Promise.all(allSignalIdsToPush.map(pushASignal));

    this.startSignalId = startSignalId;
  },
);

Given(
  "l'utente consumatore di segnali ha ottenuto un voucher api scaduto",
  async function () {
    const voucherExpired = await getExpiredVoucher();
    this.voucher = voucherExpired;
  },
);

Given(
  "l'utente ha già una richiesta di fruizione in stato {string} per quell'e-service",
  async function (agreementStatus: string) {
    const agreement = getAgreementBy(
      this.consumerId,
      this.eserviceName,
      this.TEST_SEED,
    );
    return await createOrUpdateAgreement(
      {
        ...agreement,
        ...{ eservice: this.eserviceId, state: agreementStatus },
      },
      this.consumerId,
    );
  },
);

Given(
  "l'utente ha già una finalità in stato {string} per quell'e-service",
  async function (purposeStatus: string) {
    const purpose = getPurposeBy(
      this.consumerId,
      this.eserviceName,
      this.TEST_SEED,
    );
    return await createOrUpdatePurpose(
      {
        ...purpose,
        ...{ eservice: this.eserviceId, state: purposeStatus },
      },
      this.consumerId,
    );
  },
);

Given(
  "l'utente crea una nuova finalità in stato {string} per quell' e-service",
  async function (purposeState: string) {
    const { id, name, version } = getPurposeBy(
      this.consumerId,
      this.eserviceName,
      this.TEST_SEED,
    );
    const newPurposeId = `${id}-V2`;
    const publishedEserviceId = this.eserviceId;

    return await createOrUpdatePurpose(
      {
        eservice: publishedEserviceId,
        id: newPurposeId,
        name,
        state: purposeState,
        version,
      },
      this.consumerId,
    );
  },
);

Given("il sistema ha reso disponibile il segnale", async function () {
  await sleep(process.env.TIME_WINDOW_DURATION_IN_SECONDS);
});

When(
  "l'utente recupera (un)(i) segnal(e)(i) dell'e-service {string}",
  async function (eserviceName: string) {
    const { id } = getEserviceBy(this.producerId, eserviceName, this.TEST_SEED);
    // If SignalId is not present in previous given start by signalId = 1
    const signalId = (this.startSignalId || 1) - 1;
    const pullSignalRequest = createPullSignalRequest({
      eserviceId: id,
      signalId,
      size: 10,
    });

    this.response = await pullSignalApiClient.signals.pullSignal(
      pullSignalRequest,
      getAuthorizationHeader(this.voucher),
    );
  },
);

When(
  "l'utente recupera (un)(i) segnal(e)(i) di quell'e-service",
  async function () {
    // If SignalId is not present in previous given start by signalId = 1
    const signalId = (this.startSignalId || 1) - 1;
    const pullSignalRequest = createPullSignalRequest({
      eserviceId: this.eserviceId,
      signalId,
      size: 10,
    });

    this.response = await pullSignalApiClient.signals.pullSignal(
      pullSignalRequest,
      getAuthorizationHeader(this.voucher),
    );
  },
);

When(
  "l'utente recupera un segnale di quell'e-service con un signalId uguale a {int}",
  async function (startSignalId: number) {
    const pullSignalRequest = createPullSignalRequest({
      eserviceId: this.eserviceId,
      signalId: startSignalId,
    });

    this.response = await pullSignalApiClient.signals.pullSignal(
      pullSignalRequest,
      getAuthorizationHeader(this.voucher),
    );
  },
);

When(
  "l'utente verifica lo stato del servizio di recupero segnali",
  async function () {
    this.response = await pullSignalApiClient.status.getStatus(
      getAuthorizationHeader(this.voucher),
    );
  },
);

Then(
  "la richiesta va a buon fine con status code {int} e restituisce una lista di {int} segnal(e)(i)",
  function (statusCode: number, numberOfSignalList: number) {
    const data = this.response.data;

    assert.strictEqual(data.signals?.length, numberOfSignalList);
    assert.strictEqual(this.response.status, statusCode);
  },
);

Then(
  "la richiesta va a buon fine con status code {int} e restituisce una lista di {int} segnal(e)(i) e lastSignalId = {int}",
  function (
    statusCode: number,
    signalsLength: number,
    lastSignalId: null | number,
  ) {
    const data = this.response.data;

    assert.strictEqual(data.signals?.length, signalsLength);
    assert.strictEqual(data.lastSignalId, lastSignalId);
    assert.strictEqual(this.response.status, statusCode);
  },
);

Then(
  "la richiesta va a buon fine con status code {int} e restituisce una lista di {int} segnal(e)(i) e nessun lastSignalId",
  function (statusCode: number, numberOfSignalList: number) {
    const data = this.response.data;

    assert.strictEqual(data.signals?.length, numberOfSignalList);
    assert.strictEqual(data.lastSignalId, null);
    assert.strictEqual(this.response.status, statusCode);
  },
);
