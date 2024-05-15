import { AgreementState } from "../api/interop.models";
import { client } from "../features/before-and-after";
import {
  signalProducer,
  signalConsumer,
  eserviceProducer,
} from "../lib/common";

export async function setupEserviceAgreementTable() {
  const allProducers = [signalProducer, eserviceProducer];
  let count = 0;
  for (const producer of allProducers) {
    const { id, eservices } = producer;
    for (const eservice of eservices) {
      const query = {
        text: "INSERT INTO eservice (eservice_id, producer_id, descriptor_id, event_id, state) values ($1, $2, $3, $4, $5)",
        values: [eservice.id, id, eservice.descriptor, ++count, eservice.state],
      };
      await client.query(query);
    }
  }
}

export async function setupConsumerEserviceTable() {
  const { id, agreements } = signalConsumer;
  let count = 0;
  for (const agreement of agreements) {
    const query = {
      text: "INSERT INTO consumer_eservice (agreement_id, eservice_id, consumer_id, descriptor_id, event_id, state) values ($1, $2, $3, $4, $5,$6)",
      values: [
        agreement.id,
        agreement.eservice,
        id,
        agreement.descriptor,
        ++count,
        agreement.state,
      ],
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
