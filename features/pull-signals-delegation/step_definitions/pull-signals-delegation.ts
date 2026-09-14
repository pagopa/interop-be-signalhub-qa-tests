import { Given, When } from "@cucumber/cucumber";

import { pullSignalApiClient } from "../../../api/pull-signal.client";
import { pushSignalApiClient } from "../../../api/push-signals.client";
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
import {
  getAgreementBy,
  getDelegationBy,
  getEserviceByName,
  getOrganizationByName,
  getPurposeByDelegationId,
} from "../../../lib/data.interop";
import { getVoucher } from "../../../lib/voucher";

Given(
  "l'ente erogatore ha depositato un segnale per l'e-service",
  async function () {
    const voucher = await getVoucher({
      ORGANIZATION_ID: this.producerId,
    });
    const startSignalId = 1;
    const signalRequest = createSignal({
      eserviceId: this.eserviceId,
      signalId: startSignalId,
    });

    const response = await pushSignalApiClient.signals.pushSignal(
      signalRequest,
      getAuthorizationHeader(voucher),
    );

    assertValidResponse(response);
  },
);

Given(
  "l'ente delegato {string} ha già una delega in stato {string} concessa dal {string} per l'e-service {string}",
  async function (
    delegate: string,
    delegationStatus: "ACTIVE" | "REJECTED" | "REVOKED",
    delegator: string, // delegante
    eServiceName: string,
  ) {
    const { id: delegateId } = getOrganizationByName(delegate);
    const { id: delegatorId } = getOrganizationByName(delegator);

    const delegation = getDelegationBy(
      delegatorId,
      eServiceName,
      this.TEST_SEED,
    );

    await createOrUpdateDelegation({
      ...delegation,
      kind: "DELEGATED_PRODUCER",
      state: delegationStatus,
    });

    this.delegationId = delegation.delegationId;
    this.delegatorId = delegatorId;
    this.delegateId = delegateId;
    this.eserviceName = eServiceName;
  },
);

Given(
  "l'utente dell'ente delegato ha ottenuto un voucher api",
  async function () {
    const voucher = await getVoucher({
      ORGANIZATION_ID: this.delegateId,
    });
    this.voucher = voucher;
  },
);

Given(
  "l'utente dell'ente delegato ha già una richiesta di fruizione in stato {string} per conto dell'ente delegante per quell'e-service",
  async function (agreementStatus: string) {
    const agreement = getAgreementBy(
      this.delegatorId,
      this.eserviceName,
      this.TEST_SEED,
    );

    return await createOrUpdateAgreement(
      {
        ...agreement,
        ...{ eservice: this.eserviceId, state: agreementStatus },
      },
      this.delegatorId,
    );
  },
);

Given(
  "l'utente dell'ente delegato ha già una finalità in delega in stato {string} per quell'e-service",
  async function (purposeStatus: string) {
    {
      const purpose = getPurposeByDelegationId(
        this.delegateId,
        this.delegationId,
        this.TEST_SEED,
      );
      return await createOrUpdatePurpose(
        {
          ...purpose,
          ...{ eservice: this.eserviceId, state: purposeStatus },
          delegationId: this.delegationId,
        },
        this.delegatorId, // consumerId
      );
    }
  },
);

Given(
  "l'ente delegante revoca la delega assegnata all'ente delegato",
  async function () {
    const delegation = getDelegationBy(
      this.delegatorId,
      this.eserviceName,
      this.TEST_SEED,
    );

    await createOrUpdateDelegation({
      ...delegation,
      kind: "DELEGATED_PRODUCER",
      state: "REVOKED",
    });
  },
);

Given(
  "l'ente erogatore abilita la possibilità di accesso operativo per quell'e-service",
  async function () {
    const { descriptor, enable_signal_hub, id, name, state } =
      getEserviceByName(this.producerId, this.eserviceName, this.TEST_SEED);
    await createOrUpdateEservice(
      {
        client_access_delegable: true,
        descriptor,
        enable_signal_hub,
        id,
        name,
        state,
      },
      this.producerId,
    );
  },
);

Given(
  "l'erogatore disabilita la possibilità di accesso operativo per quell'e-service",
  async function () {
    const { descriptor, enable_signal_hub, id, name, state } =
      getEserviceByName(this.producerId, this.eserviceName, this.TEST_SEED);
    await createOrUpdateEservice(
      {
        client_access_delegable: false,
        descriptor,
        enable_signal_hub,
        id,
        name,
        state,
      },
      this.producerId,
    );
  },
);
When(
  "l'utente dell'ente delegato recupera un segnale di quell'e-service",
  async function () {
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
