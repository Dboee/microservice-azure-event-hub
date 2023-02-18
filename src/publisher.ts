import { EventHubProducerClient } from '@azure/event-hubs';
import { DefaultAzureCredential } from '@azure/identity';

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

console.clear();

const eventHubsResourceName = process.env.EVENT_HUBS_RESOURCE_NAME;
const fullyQualifiedNamespace = `${eventHubsResourceName}.servicebus.windows.net`;
// eventHubName: This variable refers to the name of the
// specific Event Hub within the resource.
const eventHubName = process.env.EVENT_HUB_NAME;

// Azure Identity - passwordless authentication
const credential = new DefaultAzureCredential();

async function main() {
  // Create a producer client to send messages to the event hub.
  const producer = new EventHubProducerClient(
    fullyQualifiedNamespace,
    eventHubName,
    credential
  );

  // Prepare a batch of three events.
  const batch = await producer.createBatch();
  batch.tryAdd({ body: 'passwordless First event' });
  batch.tryAdd({ body: 'passwordless Second event' });
  batch.tryAdd({ body: 'passwordless Third event' });

  // Send the batch to the event hub.
  await producer.sendBatch(batch);

  // Close the producer client.
  await producer.close();

  console.log('A batch of three events have been sent to the event hub');
}

main().catch((err) => {
  console.log('Error occurred: ', err);
});
