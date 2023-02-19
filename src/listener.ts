import { DefaultAzureCredential } from '@azure/identity';
import {
  EventHubConsumerClient,
  earliestEventPosition,
  EventData,
  ReceivedEventData,
  PartitionContext,
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

  // Create a blob checkpoint store.
  const checkpointStore = new BlobCheckpointStore(containerClient);

  const consumerGroup = '$Default'; // name of the default consumer group, same as Durable Name

  // Create a consumer client for the event hub by specifying the checkpoint store.
  const consumerClient = new EventHubConsumerClient(
    consumerGroup, // consumer group name
    fullyQualifiedNamespace, // namespace URI
    eventHubName, // event hub name
    credential, // Azure Identity credential
    checkpointStore // Blob checkpoint store
  );

  console.log('Listener connected to Azure Event Hub');

  // Subscribe to the events, and specify handlers for processing the events and errors.
  const subscription = consumerClient.subscribe(
    {
      // The callback where you add your code to process incoming events.
      processEvents: async (events, context) => {
        if (events.length === 0) return console.log('No events to process.');

        // Process the events.
        for (const event of events) {
          console.log(
            `Received event: '${JSON.stringify(event.body)}' from partition: '${
              context.partitionId
            }' and consumer group: '${context.consumerGroup}'`
          );
        }

        // Update the checkpoint. Acknowledging the events
        await context.updateCheckpoint(events[events.length - 1]);
      },

      processError: async (err, context) => {
        console.log(`Error : ${err}`);
      },
    },
    { startPosition: earliestEventPosition }
  );
}

main().catch((err) => {
  console.log('Error occurred: ', err);
});

// An abstract class in TypeScript is a class that cannot be
// instantiated directly. It can only be used as a base class for other classes.
abstract class Listener {
  // These properties must be defined in the child class
  abstract eventHubName: string;
  abstract consumerGroup: string;
  abstract onMessage(
    data: any,
    context: PartitionContext,
    event: ReceivedEventData
  ): void;

  // These properties are defined here
  private baseUrl: string;
  private credential: DefaultAzureCredential;
  private checkpointStore: BlobCheckpointStore;
  private consumerClient: EventHubConsumerClient;

  // The constructor is called when the class is instantiated
  constructor() {
    // Initialize the properties when the class is instantiated
    this.baseUrl = `https://${process.env.STORAGE_ACCOUNT_NAME}.blob.core.windows.net`;
    this.credential = new DefaultAzureCredential();
    this.checkpointStore = new BlobCheckpointStore(
      new ContainerClient(
        `${this.baseUrl}/${process.env.STORAGE_CONTAINER_NAME}`,
        this.credential
      )
    );
    this.consumerClient = this.setConsumerClient();
  }
  // protected member is accessible from the class
  // itself and its subclasses but not from the outside world
  protected setConsumerClient() {
    return new EventHubConsumerClient(
      this.consumerGroup,
      `${process.env.EVENT_HUBS_RESOURCE_NAME}.servicebus.windows.net`,
      this.eventHubName,
      this.credential,
      this.checkpointStore
    );
  }

  // Method to parse the event data into a JSON object
  parseMessage(event: EventData) {
    const data = event.body;
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'));
  }

  // Define a method that can be called to start the listener
  async subscribe() {
    const subscription = this.consumerClient.subscribe(
      {
        processEvents: async (events, context) => {
          if (events.length === 0) return console.log('No events to process.');

          for (const event of events) {
            const parsedData = this.parseMessage(event);
            this.onMessage(parsedData, context, event);
          }

          await context.updateCheckpoint(events[events.length - 1]);
        },
        processError: async (err, context) => {
          console.log(`Error : ${err}`);
        },
      },
      { startPosition: earliestEventPosition }
    );
  }
}

class TicketCreatedListener extends Listener {
  eventHubName = 'ticketing'; // subject
  consumerGroup = 'ticketing-service'; // queueGroupName
  onMessage(data: any, context: PartitionContext, msg: ReceivedEventData) {
    // Do something with the event data
    console.log('Event data!', data);
    // Acknowledge the event
    context.updateCheckpoint(msg);
  }
}
