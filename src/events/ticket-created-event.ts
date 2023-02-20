import { Subjects } from './subjects';

export interface ITicketCreatedEvent {
  //   properties: {
  subject: Subjects.TicketCreated;
  consumerGroup: Subjects.TicketCreated;
  //   };
  data: {
    id: string;
    title: string;
    price: number;
  };
}
