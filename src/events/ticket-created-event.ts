import { ConsumerGroups } from './consumer-groups';

export interface ITicketCreatedEvent {
  //   properties: {
  subject: ConsumerGroups.TicketCreated;
  consumerGroup: ConsumerGroups.TicketCreated;
  //   };
  data: {
    id: string;
    title: string;
    price: number;
  };
}
