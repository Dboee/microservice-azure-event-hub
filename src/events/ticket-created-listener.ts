import { Listener } from './base-listener';
import {
  EventHubConsumerClient,
  PartitionContext,
  ReceivedEventData,
} from '@azure/event-hubs';

import { ITicketCreatedEvent } from './ticket-created-event';
import { ConsumerGroups } from './consumer-groups';
import { EventHubs } from './event-hubs';

class TicketCreatedListener extends Listener<ITicketCreatedEvent> {
  eventHubName: EventHubs;

  // These properties are defined here
  readonly consumerGroup = ConsumerGroups.TicketCreated;
  readonly subject = ConsumerGroups.TicketCreated;

  constructor() {
    // Azure specific properties
    const eventHubName: EventHubs = EventHubs.Tickets;
    const consumerGroup = ConsumerGroups.TicketCreated;

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
