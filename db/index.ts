import { AgreementState } from "../api/interop.models";
import { client } from "../features/before-and-after";

type TupleOfStrings<N extends number> = [string, ...string[]] & { length: N };

type EServiceAgreementTable = Array<TupleOfStrings<5>>;
type EserviceConsumerTable = Array<TupleOfStrings<6>>;

const eserviceProducerRowValues: EServiceAgreementTable = [
  [
    "31b4e4e6-855d-42fa-9705-28bc7f8545ff",
    "0e9e2dab-2e93-4f24-ba59-38d9f11198ca",
    "ac086f1f-9e34-4059-bb53-a7d676094520",
    "101",
    "PUBLISHED",
  ],
  [
    "31b4e4e6-855d-42fa-9705-28bc7f8545ff",
    "0e9e2dab-2e93-4f24-ba59-38d9f11198ca",
    "4d24ad97-4b0e-446a-8161-4f66fa6b6cf1",
    "102",
    "PUBLISHED",
  ],
  [
    "3a023c23b-7662-4971-994e-0eb9adabc728",
    "0e9e2dab-2e93-4f24-ba59-38d9f11198ca",
    "74d2cfb3-6bff-48ee-9724-14fd0857e59c",
    "103",
    "PUBLISHED",
  ],
];

const eserviceConsumerRowValues: EserviceConsumerTable = [
  [
    "5f829ad2-8f09-4c4f-9ae9-6307dd96834f",
    "31b4e4e6-855d-42fa-9705-28bc7f8545ff",
    "e79a24cd-8edc-441e-ae8d-e87c3aea0059",
    "4d24ad97-4b0e-446a-8161-4f66fa6b6cf1",
    "104",
    "ACTIVE",
  ],
];

export async function setupEserviceAgreementTable() {
  for (const row of eserviceProducerRowValues) {
    const query = {
      text: "INSERT INTO eservice (eservice_id, producer_id, descriptor_id, event_id, state) values ($1, $2, $3, $4, $5)",
      values: row,
    };
    await client.query(query);
  }
}

export async function setupConsumerEserviceTable() {
  for (const row of eserviceConsumerRowValues) {
    const query = {
      text: "INSERT INTO consumer_eservice (agreement_id, eservice_id, consumer_id, descriptor_id, event_id, state) values ($1, $2, $3, $4, $5,$6)",
      values: row,
    };
    await client.query(query);
  }
}

export async function updateConsumerAgreementState(
  agreementState: AgreementState,
  eserviceId: string
) {
  const query = {
    text: "UPDATE consumer_eservice SET state=$1 where eservice_id=$2",
    values: [agreementState, eserviceId],
  };
  await client.query(query);
}
