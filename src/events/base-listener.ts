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

require('dotenv').config();

interface Event {
  data: any;
  subject: ConsumerGroups;
  consumerGroup: ConsumerGroups;
  // properties: {
  // };
}

// An abstract class in TypeScript is a class that cannot be
// instantiated directly. It can only be used as a base class for other classes.
abstract class Listener<T extends Event> {
  // These properties must be defined in the child class
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
  private consumerClient: EventHubConsumerClient;

  // The constructor is called when the class is instantiated
  constructor(eventHubName: EventHubs, consumerGroup: T['consumerGroup']) {
    console.clear();

    // Checks variables from the environment
    if (!process.env.EVENT_HUBS_RESOURCE_NAME)
      throw new Error(
        'EVENT_HUBS_RESOURCE_NAME is not defined in the environment variables.'
      );
    if (!process.env.STORAGE_ACCOUNT_NAME)
      throw new Error(
        'STORAGE_ACCOUNT_NAME is not defined in the environment variables.'
      );
    if (!process.env.STORAGE_CONTAINER_NAME)
      throw new Error(
        'STORAGE_CONTAINER_NAME is not defined in the environment variables.'
      );
    // Initialize the properties when the class is instantiated
    this.baseUrl = `https://${process.env.STORAGE_ACCOUNT_NAME}.blob.core.windows.net`;
    this.credential = new DefaultAzureCredential();
    this.checkpointStore = new BlobCheckpointStore(
      new ContainerClient(
        `${this.baseUrl}/${process.env.STORAGE_CONTAINER_NAME}`,
        this.credential
      )
    );
    this.consumerClient = this.setConsumerClient(eventHubName, consumerGroup);
  }
  // protected member is accessible from the class
  // itself and its subclasses but not from the outside world
  protected setConsumerClient(
    eventHubName: EventHubs,
    consumerGroup: T['consumerGroup']
  ) {
    return new EventHubConsumerClient(
      consumerGroup,
      `${process.env.EVENT_HUBS_RESOURCE_NAME}.servicebus.windows.net`,
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
    const subscription = this.consumerClient!.subscribe(
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
