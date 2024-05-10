import { Given, When } from "@cucumber/cucumber";
import {
  createPullSignalRequest,
  getAuthorizationHeader,
  getVoucherForConsumer,
  getVoucherForProducer,
} from "../../../utils/common";
import { pullSignalApiClient } from "../../../api/pull-signal.client";

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
    const voucher = await getVoucherForConsumer({ purposeId: "ToBeDefined" });
    this.consumerVoucher = voucher;
  }
);

Given(
  "un utente, come consumatore di segnali, ottiene un voucher scaduto per l'accesso all'e-service lettura segnali",
  async function () {
    const today = new Date();
    const yesterday = today.setDate(today.getDate() - 1);

    const voucher = await getVoucherForConsumer({ exp: yesterday });
    this.consumerVoucher = voucher;
  }
);

When("l'utente consumatore recupera un segnale", async function () {
  const pullSignalRequest = createPullSignalRequest();

  this.response = await pullSignalApiClient.pullSignal.getRequest(
    pullSignalRequest,
    getAuthorizationHeader(this.consumerVoucher)
  );
});

When(
  "l'utente consumatore recupera un segnale per un e-service con cui non ha una richiesta di fruizione",
  async function () {
    const pullSignalRequest = createPullSignalRequest({
      eserviceId: "ToBeDefined",
    });

    this.response = await pullSignalApiClient.pullSignal.getRequest(
      pullSignalRequest,
      getAuthorizationHeader(this.consumerVoucher)
    );
  }
);
