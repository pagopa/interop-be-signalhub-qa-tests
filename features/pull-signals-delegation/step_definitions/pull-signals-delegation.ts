import { Given, When } from "@cucumber/cucumber";
import {
  getAgreementBy,
  getDelegationBy,
  getEserviceByName,
  getOrganizationByName,
  getPurposeBy,
} from "../../../lib/data.interop";
import {
  assertValidResponse,
  createOrUpdateAgreement,
  createOrUpdateDelegation,
  createOrUpdateEservice,
  createOrUpdatePurpose,
  createPullSignalRequest,
  createSignal,
  getAuthorizationHeader,
} from "../../../lib/common";
import { getVoucher } from "../../../lib/voucher";
import { pullSignalApiClient } from "../../../api/pull-signal.client";
import { pushSignalApiClient } from "../../../api/push-signals.client";

Given(
  "l'ente erogatore ha depositato un segnale per l'e-service",
  async function () {
    const voucher = await getVoucher({
      ORGANIZATION_ID: this.producerId,
    });
    const startSignalId = 1;
    const signalRequest = createSignal({
      signalId: startSignalId,
      eserviceId: this.eserviceId,
    });

    const response = await pushSignalApiClient.signals.pushSignal(
      signalRequest,
      getAuthorizationHeader(voucher)
    );

    assertValidResponse(response);
  }
);

Given(
  "l'ente delegato {string} ha già una delega in stato {string} concessa dal {string} per l'e-service {string}",
  async function (
    delegate: string,
    delegationStatus: "REJECTED" | "REVOKED" | "ACTIVE",
    delegator: string, // delegante
    eServiceName: string
  ) {
    const { id: delegateId } = getOrganizationByName(delegate);
    const { id: delegatorId } = getOrganizationByName(delegator);

    const delegation = getDelegationBy(
      delegatorId,
      eServiceName,
      this.TEST_SEED
    );

    await createOrUpdateDelegation({
      ...delegation,
      state: delegationStatus,
      kind: "DELEGATED_PRODUCER",
    });

    this.delegationId = delegation.delegationId;
    this.delegatorId = delegatorId;
    this.delegateId = delegateId;
    this.eserviceName = eServiceName;
  }
);

Given(
  "l'utente dell'ente delegato ha ottenuto un voucher api",
  async function () {
    const voucher = await getVoucher({
      ORGANIZATION_ID: this.delegateId,
    });
    this.voucher = voucher;
  }
);

Given(
  "l'utente dell'ente delegato ha già una richiesta di fruizione in stato {string} per conto dell'ente delegante per quell'e-service",
  async function (agreementStatus: string) {
    const agreement = getAgreementBy(
      this.delegatorId,
      this.eserviceName,
      this.TEST_SEED
    );

    return await createOrUpdateAgreement(
      {
        ...agreement,
        ...{ state: agreementStatus, eservice: this.eserviceId },
      },
      this.delegatorId
    );
  }
);

Given(
  "l'utente dell'ente delegato ha già una finalità in delega in stato {string} per quell'e-service",
  async function (purposeStatus: string) {
    {
      const purpose = getPurposeBy(
        this.delegateId,
        this.eserviceName,
        this.TEST_SEED
      );

      return await createOrUpdatePurpose(
        {
          ...purpose,
          ...{ state: purposeStatus, eservice: this.eserviceId },
          delegationId: this.delegationId,
        },
        this.delegatorId // consumerId
      );
    }
  }
);

Given(
  "l'ente delegante revoca la delega assegnata all'ente delegato",
  async function () {
    const delegation = getDelegationBy(
      this.delegatorId,
      this.eserviceName,
      this.TEST_SEED
    );

    await createOrUpdateDelegation({
      ...delegation,
      state: "REVOKED",
      kind: "DELEGATED_PRODUCER",
    });
  }
);

Given(
  "l'erogatore disabilita la possibilità di accesso operativo per quell'e-service",
  async function () {
    const { name, id, descriptor, state, enable_signal_hub } =
      getEserviceByName(this.producerId, this.eserviceName, this.TEST_SEED);
    await createOrUpdateEservice(
      {
        id,
        descriptor,
        state,
        enable_signal_hub,
        name,
        client_access_delegable: false,
      },
      this.producerId
    );
  }
);
When(
  "l'utente dell'ente delegato recupera (un)(i) segnal(e)(i) di quell'e-service",
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
      getAuthorizationHeader(this.voucher)
    );
  }
);
