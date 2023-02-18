import { DefaultAzureCredential } from '@azure/identity';
import {
  EventHubConsumerClient,
  earliestEventPosition,
} from '@azure/event-hubs';
import { ContainerClient } from '@azure/storage-blob';
import { BlobCheckpointStore } from '@azure/eventhubs-checkpointstore-blob';

require('dotenv').config();

// Variables from the environment
if (!process.env.EVENT_HUBS_RESOURCE_NAME)
  throw new Error(
    'EVENT_HUBS_RESOURCE_NAME is not defined in the environment variables.'
  );
if (!process.env.EVENT_HUB_NAME)
  throw new Error(
    'EVENT_HUB_NAME is not defined in the environment variables.'
  );
if (!process.env.STORAGE_ACCOUNT_NAME)
  throw new Error(
    'STORAGE_ACCOUNT_NAME is not defined in the environment variables.'
  );
if (!process.env.STORAGE_CONTAINER_NAME)
  throw new Error(
    'STORAGE_CONTAINER_NAME is not defined in the environment variables.'
  );

console.clear();

// Event hubs
const eventHubsResourceName = process.env.EVENT_HUBS_RESOURCE_NAME;
const fullyQualifiedNamespace = `${eventHubsResourceName}.servicebus.windows.net`;
const eventHubName = process.env.EVENT_HUB_NAME;
const consumerGroup = '$Default'; // name of the default consumer group

// Azure Storage
const storageAccountName = process.env.STORAGE_ACCOUNT_NAME;
const storageContainerName = process.env.STORAGE_CONTAINER_NAME;
const baseUrl = `https://${storageAccountName}.blob.core.windows.net`;

// Azure Identity - passwordless authentication
const credential = new DefaultAzureCredential();

async function main() {
  // Create a blob container client and a blob checkpoint store using the client.
  const containerClient = new ContainerClient(
    `${baseUrl}/${storageContainerName}`,
    credential
  );
  const checkpointStore = new BlobCheckpointStore(containerClient);

  // Create a consumer client for the event hub by specifying the checkpoint store.
  const consumerClient = new EventHubConsumerClient(
    consumerGroup,
    fullyQualifiedNamespace,
    eventHubName,
    credential,
    checkpointStore
  );

  // Subscribe to the events, and specify handlers for processing the events and errors.
  const subscription = consumerClient.subscribe(
    {
      processEvents: async (events, context) => {
        if (events.length === 0) {
          console.log(
            `No events received within wait time. Waiting for next interval`
          );
          return;
        }

        for (const event of events) {
          console.log(
            `Received event: '${event.body}' from partition: '${context.partitionId}' and consumer group: '${context.consumerGroup}'`
          );
        }
        // Update the checkpoint.
        await context.updateCheckpoint(events[events.length - 1]);
      },

      processError: async (err, context) => {
        console.log(`Error : ${err}`);
      },
    },
    { startPosition: earliestEventPosition }
  );

  // After 30 seconds, stop processing.
  await new Promise((resolve: (value?: unknown) => void) => {
    setTimeout(async () => {
      await subscription.close();
      await consumerClient.close();
      resolve(undefined);
    }, 30000);
  });
}

main().catch((err) => {
  console.log('Error occurred: ', err);
});
