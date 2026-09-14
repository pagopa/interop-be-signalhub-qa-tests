import "../configs/env";
import fs from "fs";

export type Agreement = {
  descriptor: string;
  eservice: string;
  id: string;
  name: string;
  purpose: string;
  state: string;
};

export type Delegation = {
  delegateId: string;
  delegationId: string;
  delegatorId: string;
  eServiceId: string;
  kind: "DELEGATED_CONSUMER" | "DELEGATED_PRODUCER";
  state: string;
};

export type Eservice = {
  client_access_delegable?: boolean;
  descriptor: string;
  enable_signal_hub: boolean;
  id: string;
  name: string;
  state: string;
};

export type Organization = {
  agreements: Agreement[];
  delegation: Delegation[];
  eservices: Eservice[];
  id: string;
  name: string;
  purposes: Purpose[];
};

export type Purpose = {
  delegationId?: string;
  eservice: string;
  id: string;
  name: string;
  state: string;
  version: string;
};

export function getAgreementBy(
  organizationId: string,
  eserviceName: string,
  seed?: string,
): Agreement {
  const agreement = getOrganizationById(organizationId)
    .agreements.filter(isEqual("name", eserviceName))
    .shift();
  if (agreement === undefined) {
    throw Error(`agreement for e-service ${eserviceName} not found`);
  }
  return { ...agreement, ...{ id: idSeeded(agreement.id, seed) } };
}

export function getDelegationBy(
  organizationId: string,
  eserviceName: string,
  seed?: string,
): Delegation {
  const delegation = getOrganizationById(organizationId)
    .delegation.filter(isEqual("eservice", eserviceName))
    .shift();

  if (delegation === undefined) {
    throw Error(`delegation for e-service ${eserviceName} not found`);
  }

  return {
    ...delegation,
    ...{
      delegationId: idSeeded(delegation.delegationId, seed),
      eServiceId: idSeeded(delegation.eServiceId, seed),
    },
  };
}

export function getEserviceBy(
  organizationId: string,
  eserviceName: string,
  seed?: string,
): Eservice {
  const eservice = getOrganizationById(organizationId)
    .eservices.filter(isEqual("name", eserviceName))
    .shift();
  if (eservice === undefined) {
    throw Error(`e-service ${eserviceName} not found`);
  }
  return { ...eservice, ...{ id: idSeeded(eservice.id, seed) } };
}

export function getEserviceByName(
  organizationId: string,
  eserviceName: string,
  seed?: string,
): Eservice {
  const eservice = getOrganizationById(organizationId)
    .eservices.filter(isEqual("name", eserviceName))
    .shift();
  if (eservice === undefined) {
    throw Error(`e-service ${eserviceName} not found`);
  }
  return { ...eservice, ...{ id: idSeeded(eservice.id, seed) } };
}

export function getOrganizationById(organizationId: string): Organization {
  const organization = getInteropData().find(
    (organization) => organization.id === organizationId,
  );
  if (organization === undefined) {
    throw Error(`Organization ${organizationId} not found`);
  }
  return organization;
}

export function getOrganizationByName(organizationName: string): Organization {
  const organization = getInteropData().find(
    (organization) => organization.name === organizationName,
  );
  if (organization === undefined) {
    throw Error(`Organization ${organizationName} not found`);
  }
  return organization;
}

export function getPurposeBy(
  organizationId: string,
  eserviceName: string,
  seed?: string,
): Purpose {
  const purpose = getOrganizationById(organizationId)
    .purposes.filter(isEqual("name", eserviceName))
    .shift();
  if (purpose === undefined) {
    throw Error(`purpose for e-service ${eserviceName} not found`);
  }
  return { ...purpose, ...{ id: idSeeded(purpose.id, seed) } };
}

export function getPurposeByDelegationId(
  organizationId: string,
  delegationId: string,
  seed?: string,
) {
  const delegationIdWithoutTestSeed = delegationId.split("|")[1];
  const purpose = getOrganizationById(organizationId).purposes.find(
    (purpose) => purpose.delegationId === delegationIdWithoutTestSeed,
  );

  if (purpose === undefined) {
    throw Error(
      `purpose for delegationId ${delegationIdWithoutTestSeed} not found`,
    );
  }
  return { ...purpose, ...{ id: idSeeded(purpose.id, seed) } };
}

function getInteropData(): Organization[] {
  return JSON.parse(
    Buffer.from(
      fs.readFileSync(process.env.CATALOG_INTEROP_DATA_PREPARATION_FILE),
    ).toString(),
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isEqual = (key: string, value: string) => (item: any) =>
  item[key] === value;

// const isIncluded = (key: string, value: string) => (item: any) =>
//   value.includes(item[key]);

const idSeeded = (id: string, seed?: string) => `${seed}${id}`;
