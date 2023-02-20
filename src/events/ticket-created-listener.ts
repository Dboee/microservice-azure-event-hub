import { Listener } from './base-listener';
import {
  EventHubConsumerClient,
  PartitionContext,
  ReceivedEventData,
} from '@azure/event-hubs';

import { ITicketCreatedEvent } from './ticket-created-event';
import { Subjects } from './subjects';

// const getPartitionIds = async (client: EventHubConsumerClient) => {
//   const partitionIds = await client.getPartitionIds();
//   console.log('Available partitions:', partitionIds);
// };

class TicketCreatedListener extends Listener<ITicketCreatedEvent> {
  eventHubName: string;

  // These properties are defined here
  readonly consumerGroup = Subjects.TicketCreated;
  readonly subject = Subjects.TicketCreated;

  constructor() {
    // Checks event hub name variable from the environment
    if (!process.env.EVENT_HUB_NAME)
      throw new Error(
        'EVENT_HUB_NAME is not defined in the environment variables.'
      );
    // Azure specific properties
    const eventHubName = process.env.EVENT_HUB_NAME;
    const consumerGroup = Subjects.TicketCreated;

    // Calls constructor of Listener, passing in the eventHubName and consumerGroup
    super(eventHubName, consumerGroup);

    // Sets the subject property
    this.eventHubName = eventHubName;
  }

  onMessage(
    data: ITicketCreatedEvent['data'],
    context: PartitionContext,
    msg: ReceivedEventData
  ) {
    // Do something with the event data
    console.log(
      'event #',
      msg.sequenceNumber,
      ' - ',
      data.title,
      ' - $',
      data.price
    );

    // console.log('context: ', context);
    // console.log('msg: ', msg);
    // console.log('data: ', data);

    // Acknowledge the event
    context.updateCheckpoint(msg);
  }
}

export { TicketCreatedListener };
