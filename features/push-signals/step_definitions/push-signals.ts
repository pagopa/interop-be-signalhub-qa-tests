import assert from "assert";
import { Given, Then, When } from "@cucumber/cucumber";
import {
  createOrUpdateEservice,
  createSignal,
  getAuthorizationHeader,
  sleep,
  updateEserviceSHOptions,
} from "../../../lib/common";
import { pushSignalApiClient } from "../../../api/push-signals.client";
import { SignalPayload, SignalType } from "../../../api/push-signals.models";
import { getVoucher } from "../../../lib/voucher";
import {
  getOrganizationByName,
  getEserviceBy,
  getEserviceByName,
} from "../../../lib/data.interop";

Given(
  "l'ente {string}, aderente a PDND Interop, è erogatore dell'e-service e produttore dei segnali",
  function (organizationName: string) {
    const organization = getOrganizationByName(organizationName);
    this.producerId = organization.id;
  }
);

Given(
  "l'ente erogatore ha pubblicato un e-service denominato {string} abilitato a Signal Hub",
  async function (eserviceName: string) {
    const { name, id, descriptor, state, enable_signal_hub } =
      getEserviceByName(this.producerId, eserviceName, this.TEST_SEED);
    await createOrUpdateEservice(
      {
        id,
        descriptor,
        state,
        enable_signal_hub,
        name,
      },
      this.producerId
    );

    this.eserviceId = id;
    this.eserviceName = name;
  }
);

Given(
  "l'utente produttore di segnali ha ottenuto un voucher api",
  async function () {
    const voucher = await getVoucher({
      ORGANIZATION_ID: this.producerId,
    });
    this.voucher = voucher;
  }
);

Given(
  "l'utente ha pubblicato un secondo e-service denominato {string} con l'opzione utilizzo SH",
  async function (eserviceName: string) {
    const eservice = getEserviceByName(
      this.producerId,
      eserviceName,
      this.TEST_SEED
    );
    const { id, descriptor, state, name } = eservice;
    await createOrUpdateEservice(
      {
        id,
        descriptor,
        state,
        enable_signal_hub: true,
        name,
      },
      this.producerId
    );

    this.anotherEserviceId = id;
  }
);

Given(
  "Un utente, appartenente a un'altra organizzazione denominata {string}, come erogatore ha pubblicato un e-service denominato {string} con il flag utilizzo SH",
  async function (organizationName: string, eserviceName: string) {
    const organization = getOrganizationByName(organizationName);
    const eservice = getEserviceByName(
      organization.id,
      eserviceName,
      this.TEST_SEED
    );
    const { id, descriptor, state, name } = eservice;
    await createOrUpdateEservice(
      {
        id,
        descriptor,
        state,
        enable_signal_hub: true,
        name,
      },
      organization.id
    );

    this.anotherOrganizationEserviceId = id;
  }
);

Given(
  "l'utente ha creato un e-service denominato {string} in stato {string} con l'opzione utilizzo SH",
  async function (eserviceName: string, eserviceState: string) {
    const { id, descriptor, name } = getEserviceBy(
      this.producerId,
      eserviceName,
      this.TEST_SEED
    );
    await createOrUpdateEservice(
      {
        id,
        descriptor,
        state: eserviceState,
        enable_signal_hub: true,
        name,
      },
      this.producerId
    );

    this.notPublishedEserviceId = id;
  }
);

Given(
  "l'utente ha pubblicato un e-service denominato {string} senza l'opzione utilizzo SH",
  async function (eserviceName: string) {
    const eservice = getEserviceByName(
      this.producerId,
      eserviceName,
      this.TEST_SEED
    );
    const { id, descriptor, state, name } = eservice;
    await createOrUpdateEservice(
      {
        id,
        descriptor,
        state,
        enable_signal_hub: false,
        name,
      },
      this.producerId
    );

    this.eserviceId = id;
  }
);

Given(
  "l'utente, come erogatore, aggiorna l'e-service disabilitando l'opzione utilizzo SH",
  async function () {
    await updateEserviceSHOptions(this.eserviceId, false);
  }
);

When(
  "l'utente deposita un segnale per il secondo e-service",
  async function () {
    const nextSignalId = (this.requestSignalId as number) + 1;
    const signalRequest = createSignal({
      signalId: nextSignalId,
      eserviceId: this.anotherEserviceId,
    });

    this.response = await pushSignalApiClient.signals.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );

    this.requestSignalId = signalRequest.signalId;
  }
);

When(
  "l'utente deposita un segnale per il secondo e-service con lo stesso signalId del primo",
  async function () {
    const signalRequest = createSignal({
      signalId: this.requestSignalId,
      eserviceId: this.anotherEserviceId,
    });

    this.response = await pushSignalApiClient.signals.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
    this.requestSignalId = signalRequest.signalId;
  }
);

When(
  "l'utente deposita un segnale per quell'e-service con lo stesso signalId del primo",
  async function () {
    await sleep(process.env.WAIT_BEFORE_PUSHING_DUPLICATED_SIGNALID_IN_MS);

    const signalRequest = createSignal({
      eserviceId: this.eserviceId,
      signalId: this.requestSignalId,
    });

    this.response = await pushSignalApiClient.signals.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When(
  "l'utente deposita un segnale per (il primo e-service)(quell'e-service)",
  async function () {
    const signalRequest = createSignal({
      eserviceId: this.eserviceId,
    });

    this.response = await pushSignalApiClient.signals.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );

    this.requestSignalId = signalRequest.signalId;
  }
);

When(
  "l'utente deposita un segnale per un e-service che non esiste",
  async function () {
    const eserviceId = "this-eservice-does-not-exist";
    const signalRequest = createSignal({ eserviceId });

    this.response = await pushSignalApiClient.signals.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When(
  "l'utente deposita un segnale per un e-service che non è stato pubblicato",
  async function () {
    const signalRequest = createSignal({
      eserviceId: this.notPublishedEserviceId,
    });

    this.response = await pushSignalApiClient.signals.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When(
  "l'utente deposita un segnale per quell'e-service con una tipologia non prevista",
  async function () {
    const signalRequest = createSignal({
      eserviceId: this.eserviceId,
      signalType: "THIS-SIGNALTYPE-DOES-NOT-EXIST" as SignalType,
    });

    this.response = await pushSignalApiClient.signals.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When(
  "l'utente deposita un segnale per quell'e-service con un body non ben formato",
  async function () {
    const body =
      '{\n  "signalId":signal-malformatted,\n  "objectType": "1",\n  "objectId": "1",\n  "eserviceId": "{{eserviceId_attivo_31b4}}",\n  "signalType": "UPDATE"\n}';
    this.response = await pushSignalApiClient.signals.pushSignal(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body as any,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When(
  "l'utente deposita un segnale per quell'e-service con un body non valido",
  async function () {
    const body =
      '{"glossary":{"title":"example glossary","GlossDiv":{"title":"S","GlossList":{"GlossEntry":{"ID":"SGML","SortAs":"SGML","GlossTerm":"Standard Generalized Markup Language","Acronym":"SGML","Abbrev":"ISO 8879:1986","GlossDef":{"para":"A meta-markup language, used to create markup languages such as DocBook.","GlossSeeAlso":["GML","XML"]},"GlossSee":"markup"}}}}}';
    this.response = await pushSignalApiClient.signals.pushSignal(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body as any,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When(
  "l'utente deposita un segnale per quell'e-service con tipologia {string}",
  async function (signalType: SignalType) {
    const signalRequest = createSignal({
      eserviceId: this.eserviceId,
      signalType,
    });

    this.response = await pushSignalApiClient.signals.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );

    this.requestSignalId = signalRequest.signalId;
  }
);

When(
  "l'utente deposita un segnale vuoto per quell'e-service",
  async function () {
    this.response = await pushSignalApiClient.signals.pushSignal(
      { eserviceId: this.eserviceId } as SignalPayload,
      getAuthorizationHeader(this.voucher)
    );
  }
);

When(
  "l'utente deposita un segnale per un e-service di cui non è erogatore",
  async function () {
    const signalRequest = createSignal({
      eserviceId: this.anotherOrganizationEserviceId,
    });

    this.response = await pushSignalApiClient.signals.pushSignal(
      signalRequest,
      getAuthorizationHeader(this.voucher)
    );
  }
);

Then("la richiesta va a buon fine con status code 200", function () {
  assert.strictEqual(this.response.status, 200);
});

Then(
  "la richiesta va in errore con status code {int}",
  function (statusCode: number) {
    const { errors } = this.response.data;
    assert.strictEqual(this.response.status, statusCode);
    assert.ok(errors.length > 0);
  }
);

Then(
  "la richiesta va a buon fine con status code 200 e il segnale viene preso in carico",
  function () {
    const { signalId } = this.response.data;
    assert.strictEqual(signalId, this.requestSignalId);
    assert.strictEqual(this.response.status, 200);
  }
);

When(
  "l'utente verifica lo stato del servizio di deposito segnali",
  async function () {
    this.response = await pushSignalApiClient.status.getStatus(
      getAuthorizationHeader(this.voucher)
    );
  }
);

Given(
  "l'(utente)(utente produttore di segnali) pubblica una nuova versione dell e-service",
  async function () {
    const { name, descriptor, enable_signal_hub, state } = getEserviceBy(
      this.producerId,
      this.eserviceName,
      this.TEST_SEED
    );
    const publishedEserviceId = this.eserviceId;
    const newDescriptorId = `${descriptor}-V2`;

    await createOrUpdateEservice(
      {
        id: publishedEserviceId,
        descriptor: newDescriptorId,
        name,
        enable_signal_hub,
        state,
      },
      this.producerId
    );
  }
);

Given(
  "la prima versione dell' e-service è già in stato {string}",
  async function (state: string) {
    const { id, name, descriptor, enable_signal_hub } = getEserviceBy(
      this.producerId,
      this.eserviceName,
      this.TEST_SEED
    );

    await createOrUpdateEservice(
      {
        id,
        descriptor,
        name,
        enable_signal_hub,
        state,
      },
      this.producerId
    );
  }
);

Given(
  "la seconda versione dell' e-service è già in stato {string}",
  async function (state: string) {
    const { id, name, descriptor, enable_signal_hub } = getEserviceBy(
      this.producerId,
      this.eserviceName,
      this.TEST_SEED
    );
    const newDescriptorId = `${descriptor}-V2`;

    await createOrUpdateEservice(
      {
        id,
        descriptor: newDescriptorId,
        name,
        enable_signal_hub,
        state,
      },
      this.producerId
    );
  }
);
