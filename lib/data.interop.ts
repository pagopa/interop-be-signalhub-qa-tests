import "../configs/env";
import fs from "fs";

export type Eservice = {
  name: string;
  id: string;
  descriptor: string;
  state: string;
  enable_signal_hub: boolean;
};

export type Agreement = {
  id: string;
  state: string;
  eservice: string;
  name: string;
  descriptor: string;
  purpose: string;
};

export type Purpose = {
  id: string;
  version: string;
  state: string;
  eservice: string;
  name: string;
};

export type Organization = {
  id: string;
  name: string;
  eservices: Eservice[];
  agreements: Agreement[];
  purposes: Purpose[];
};

export type Delegation = {
  delegationId: string;
  delegateId: string;
  delegatorId: string;
  eServiceId: string;
  state: string;
  kind: string;
};

function getInteropData(): Organization[] {
  return JSON.parse(
    Buffer.from(
      fs.readFileSync(process.env.CATALOG_INTEROP_DATA_PREPARATION_FILE)
    ).toString()
  );
}

export function getOrganizationByName(organizationName: string): Organization {
  const organization = getInteropData().find(
    (organization) => organization.name === organizationName
  );
  if (organization === undefined) {
    throw Error(`Organization ${organizationName} not found`);
  }
  return organization;
}

export function getOrganizationById(organizationId: string): Organization {
  const organization = getInteropData().find(
    (organization) => organization.id === organizationId
  );
  if (organization === undefined) {
    throw Error(`Organization ${organizationId} not found`);
  }
  return organization;
}

export function getEserviceByName(
  organizationId: string,
  eserviceName: string,
  seed?: string
): Eservice {
  const eservice = getOrganizationById(organizationId)
    .eservices.filter(isEqual("name", eserviceName))
    .shift();
  if (eservice === undefined) {
    throw Error(`e-service ${eserviceName} not found`);
  }
  return { ...eservice, ...{ id: idSeeded(eservice.id, seed) } };
}

export function getEserviceBy(
  organizationId: string,
  eserviceName: string,
  seed?: string
): Eservice {
  const eservice = getOrganizationById(organizationId)
    .eservices.filter(isEqual("name", eserviceName))
    .shift();
  if (eservice === undefined) {
    throw Error(`e-service ${eserviceName} not found`);
  }
  return { ...eservice, ...{ id: idSeeded(eservice.id, seed) } };
}

export function getAgreementBy(
  organizationId: string,
  eserviceName: string,
  seed?: string
): Agreement {
  const agreement = getOrganizationById(organizationId)
    .agreements.filter(isEqual("name", eserviceName))
    .shift();
  if (agreement === undefined) {
    throw Error(`agreement for e-service ${eserviceName} not found`);
  }
  return { ...agreement, ...{ id: idSeeded(agreement.id, seed) } };
}

export function getPurposeBy(
  organizationId: string,
  eserviceName: string,
  seed?: string
): Purpose {
  const purpose = getOrganizationById(organizationId)
    .purposes.filter(isEqual("name", eserviceName))
    .shift();
  if (purpose === undefined) {
    throw Error(`purpose for e-service ${eserviceName} not found`);
  }
  return { ...purpose, ...{ id: idSeeded(purpose.id, seed) } };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isEqual = (key: string, value: string) => (item: any) =>
  item[key] === value;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// const isIncluded = (key: string, value: string) => (item: any) =>
//   value.includes(item[key]);

const idSeeded = (id: string, seed?: string) => `${seed}${id}`;
