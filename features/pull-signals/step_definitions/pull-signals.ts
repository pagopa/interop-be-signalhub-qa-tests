import assert from "assert";
import { Given, Then, When } from "@cucumber/cucumber";
import {
  ESERVICEID_PROVIDED_BY_SAME_ORGANIZATION,
  assertValidResponse,
  createPullSignalRequest,
  createSignal,
  getAuthorizationHeader,
  getRandomSignalId,
  getVoucherForConsumer,
  getVoucherForProducer,
  sleep,
} from "../../../utils/common";
import { pullSignalApiClient } from "../../../api/pull-signal.client";
import { pushSignalApiClient } from "../../../api/push-signals.client";

Given(
  "un utente, come produttore di segnali, ottiene un voucher valido per l'accesso all'e-service deposito segnali",
  async function () {
    const voucher = await getVoucherForProducer();
    this.producerVoucher = voucher;
  }
);

Given(
  "un utente, come consumatore di segnali, ottiene un voucher valido per l'accesso all'e-service lettura segnali",
  async function () {
    const voucher = await getVoucherForConsumer();
    this.consumerVoucher = voucher;
  }
);

Given(
  "un utente, come consumatore di segnali, ottiene un voucher valido per un e-service diverso dall'e-service di lettura segnali",
  async function () {
    const voucher = await getVoucherForProducer();
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
  const pullSignalRequest = createPullSignalRequest({
    signalId: (this.lastSignalId || 1) - 1,
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
    for (let i = 1; i <= signalLength; i++) {
      signalId = i;
      console.log("Request with signalId:", signalId);
      this.response = await pushSignalApiClient.pushSignal.pushSignal(
        {
          ...signalRequest,
          signalId,
        },
        getAuthorizationHeader(this.producerVoucher)
      );

      assertValidResponse(this.response);
    }
    await sleep(5000);
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
