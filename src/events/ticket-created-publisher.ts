import { Publisher } from './base-publisher';
import { ITicketCreatedEvent } from './ticket-created-event';
import { ConsumerGroups } from './consumer-groups';
import { EventHubs } from './event-hubs';

export class TicketCreatedPublisher extends Publisher<ITicketCreatedEvent> {
  eventHubName: EventHubs.Tickets = EventHubs.Tickets;
  consumerGroup: ConsumerGroups.TicketCreated = ConsumerGroups.TicketCreated;
  constructor() {
    const eventHubName: EventHubs.Tickets = EventHubs.Tickets;
    const consumerGroup: ConsumerGroups.TicketCreated =
      ConsumerGroups.TicketCreated;
    super(eventHubName, consumerGroup);
  }
}
