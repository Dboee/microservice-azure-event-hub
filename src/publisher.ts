import { EventData, EventHubProducerClient } from '@azure/event-hubs';
import { DefaultAzureCredential } from '@azure/identity';

import { Subjects } from './events/subjects';

require('dotenv').config();

// Event hubs
// This variable refers to the name of the Azure resource
// that the Event Hub belongs to.
if (!process.env.EVENT_HUBS_RESOURCE_NAME)
  throw new Error(
    'EVENT_HUBS_RESOURCE_NAME is not defined in the environment variables.'
  );
if (!process.env.EVENT_HUB_NAME)
  throw new Error(
    'EVENT_HUB_NAME is not defined in the environment variables.'
  );

const eventHubsResourceName = process.env.EVENT_HUBS_RESOURCE_NAME;
const fullyQualifiedNamespace = `${eventHubsResourceName}.servicebus.windows.net`;
// eventHubName: This variable refers to the name of the
// specific Event Hub within the resource.
const eventHubName = process.env.EVENT_HUB_NAME;

// Azure Identity - passwordless authentication
const credential = new DefaultAzureCredential();

async function main() {
  console.clear();
  // Create a producer client to send messages to the event hub.
  const producer = new EventHubProducerClient(
    fullyQualifiedNamespace,
    eventHubName,
    credential
  );

  const batch = await producer.createBatch();
  const message: EventData = {
    body: {
      id: '123',
      title: 'concert',
      price: 20,
    },
    properties: {
      subject: Subjects.TicketCreated,
      consumerGroup: Subjects.TicketCreated,
    },
  };

  batch.tryAdd(message);

  if (!message.properties) throw new Error('No property in event');
  if (!message.properties.subject)
    throw new Error('No subject property in event');

  await producer.sendBatch(batch);

  // Close the producer client.
  await producer.close();

  console.log(`Sent a batch as ${message.properties.subject} to the event hub`);
}

main().catch((err) => {
  console.log('Error occurred: ', err);
});
