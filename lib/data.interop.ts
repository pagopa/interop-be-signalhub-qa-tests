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

function getInteropData(): Organization[] {
  return JSON.parse(
    Buffer.from(
      fs.readFileSync(process.env.CATALOG_INTEROP_DATA_PREPARATION_FILE)
    ).toString()
  );
}

// export function getEServiceProducerInfo(): Omit<EserviceInfo, "isEnabledToSH"> {
//   const eserviceName = "domicili digitali";
//   const producerId = "aaa";
//   const {
//     id: eServiceId,
//     descriptor,
//     state,
//   } = getEserviceBy(producerId, eserviceName);

//   return {
//     eServiceId,
//     producerId,
//     descriptorId: descriptor,
//     state,
//   };
// }

// export function getEserviceProducerDiffOwnerInfo(): Omit<
//   EserviceInfo,
//   "isEnabledToSH"
// > {
//   /*
//   const { eservices, id: producerId } = signalProducer;
//   const { id: eServiceId, descriptor, state } = eservices[0];
//   return { eServiceId, producerId, descriptorId: descriptor, state };
//   */
//   const eserviceName = "domicili digitali";
//   const producerId = "aaa";
//   const {
//     id: eServiceId,
//     descriptor,
//     state,
//   } = getEserviceBy(producerId, eserviceName);

//   return {
//     eServiceId,
//     producerId,
//     descriptorId: descriptor,
//     state,
//   };
// }

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

export function getEserviceBy(
  organizationId: string,
  eserviceName: string
): Eservice {
  const eservice = getOrganizationById(organizationId)
    .eservices.filter(isEqual("name", eserviceName))
    .shift();
  if (eservice === undefined) {
    throw Error(`e-service ${eserviceName} not found`);
  }
  return eservice;
}

export function getEserviceById(
  organizationId: string,
  eserviceId: string
): Eservice {
  const eservice = getOrganizationById(organizationId)
    .eservices.filter(isEqual("id", eserviceId))
    .shift();
  if (eservice === undefined) {
    throw Error(`e-service ${eserviceId} not found`);
  }
  return eservice;
}

export function getEserviceByState(
  organizationId: string,
  state: string
): Eservice {
  const eservice = getOrganizationById(organizationId)
    .eservices.filter(isEqual("state", state))
    .shift();
  if (eservice === undefined) {
    throw Error(`e-service with state ${state} not found`);
  }
  return eservice;
}

export function getAgreementBy(
  organizationId: string,
  eserviceName: string
): Agreement {
  const agreement = getOrganizationById(organizationId)
    .agreements.filter(isEqual("name", eserviceName))
    .shift();
  if (agreement === undefined) {
    throw Error(`agreement for e-service ${eserviceName} not found`);
  }
  return agreement;
}

export function getPurposeBy(
  organizationId: string,
  eserviceName: string
): Purpose {
  const purpose = getOrganizationById(organizationId)
    .purposes.filter(isEqual("name", eserviceName))
    .shift();
  if (purpose === undefined) {
    throw Error(`purpose for e-service ${eserviceName} not found`);
  }
  return purpose;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isEqual = (key: string, value: string) => (item: any) =>
  item[key] === value;
