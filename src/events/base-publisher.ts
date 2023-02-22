import { EventData, EventHubProducerClient } from '@azure/event-hubs';
import { DefaultAzureCredential } from '@azure/identity';

import { ConsumerGroups } from './consumer-groups';
import { EventHubs } from './event-hubs';

const EVENT_HUBS_NAMESPACE_CONNECTION_STRING = ''; // Get this from Azure Portal

interface Event {
  consumerGroup: ConsumerGroups;
  data: any;
}

export abstract class Publisher<T extends Event> {
  abstract consumerGroup: T['consumerGroup'];

  // Azure Spesific
  abstract eventHubName: EventHubs;
  private credentialString: string;
  // private eventHubsResourceName: string;
  // private fullyQualifiedNamespace: string;
  // private credential: DefaultAzureCredential;

  private client: EventHubProducerClient;

  constructor(eventHubName: EventHubs, consumerGroup: T['consumerGroup']) {
    // Client Setup
    // this.eventHubsResourceName = EVENT_HUBS_RESOURCE_NAME;
    // this.fullyQualifiedNamespace = `${this.eventHubsResourceName}.servicebus.windows.net`;
    // this.credential = new DefaultAzureCredential();
    if (!EVENT_HUBS_NAMESPACE_CONNECTION_STRING)
      throw new Error('No connection string defined for event hub');
    this.credentialString = EVENT_HUBS_NAMESPACE_CONNECTION_STRING;

    this.client = this.setConsumerClient(eventHubName, consumerGroup);
  }

  protected setConsumerClient(
    eventHubName: EventHubs,
    consumerGroup: T['consumerGroup']
  ) {
    return new EventHubProducerClient(this.credentialString, eventHubName);
  }

  async publish(data: T['data']) {
    const batch = await this.client.createBatch();
    const message: EventData = {
      body: data,
      properties: {
        consumerGroup: this.consumerGroup,
      },
    };

    if (!message.properties) throw new Error('No property defined in event');
    if (!message.properties.consumerGroup)
      throw new Error('No consumerGroup defined in event');

    batch.tryAdd(message);

    try {
      await this.client.sendBatch(batch);
    } catch (error: any) {
      console.error(error);
      throw new Error(error);
    }

    // Close the producer client.
    await this.client.close();

    console.log(
      `Event Published to ${this.eventHubName}:${message.properties.consumerGroup}`
    );
  }
}
