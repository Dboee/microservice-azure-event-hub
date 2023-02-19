import { ReceivedEventData, PartitionContext } from '@azure/event-hubs';
import { TicketCreatedListener } from './events/ticket-created-listener';

new TicketCreatedListener().listen();
