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

import { ConsumerGroups } from './consumer-groups';
import { EventHubs } from './event-hubs';

const EVENT_HUBS_RESOURCE_NAME = 'microservice-namespace';
const STORAGE_ACCOUNT_NAME = 'microservicestorageacc';
const STORAGE_CONTAINER_NAME = 'eventhub-container';

interface Event {
  data: any;
  subject: ConsumerGroups;
  consumerGroup: ConsumerGroups;
}

// An abstract class in TypeScript is a class that cannot be
// instantiated directly. It can only be used as a base class for other classes.
abstract class Listener<T extends Event> {
  // These abstract properties must be defined in the child class
  abstract subject: T['subject'];
  abstract onMessage(
    data: T['data'],
    context: PartitionContext,
    event: ReceivedEventData
  ): void;
  // Azure specific properties
  abstract eventHubName: EventHubs; // Azure Event Hub name
  abstract consumerGroup: T['consumerGroup']; // Azure Event Hub consumer group

  // These properties are defined here
  private baseUrl: string;
  private credential: DefaultAzureCredential;
  private checkpointStore: BlobCheckpointStore;
  private client: EventHubConsumerClient;

  // The constructor is called when the class is instantiated
  constructor(eventHubName: EventHubs, consumerGroup: T['consumerGroup']) {
    console.clear();

    // Initialize the properties when the class is instantiated
    this.baseUrl = `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`;
    this.credential = new DefaultAzureCredential();
    this.checkpointStore = new BlobCheckpointStore(
      new ContainerClient(
        `${this.baseUrl}/${STORAGE_CONTAINER_NAME}`,
        this.credential
      )
    );
    this.client = this.setConsumerClient(eventHubName, consumerGroup);
  }

  // protected member is accessible from the class
  // itself and its subclasses but not from the outside world
  private setConsumerClient(
    eventHubName: EventHubs,
    consumerGroup: T['consumerGroup']
  ) {
    return new EventHubConsumerClient(
      consumerGroup,
      `${EVENT_HUBS_RESOURCE_NAME}.servicebus.windows.net`,
      eventHubName,
      this.credential,
      this.checkpointStore
      // configures the client to receive events from a specific partition
      // { partitionId: this.partition }
    );
  }

  // Method to parse the event data into a JSON object
  parseMessage(event: EventData) {
    const data = event.body;
    return data;
  }

  // Define a method that can be called to start the listener
  async listen() {
    console.log('Listener conntected to Azure Event Hub');
    const subscription = this.client!.subscribe(
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
          console.log(`Subscription processError : ${err}`);
        },
      },
      { startPosition: { '1': earliestEventPosition } }
    );
  }
}

export { Listener };
