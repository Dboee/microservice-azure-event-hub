// Event Hub (Azure Event Hubs) / Subject (NATS):
// A stream of events, which can be hierarchical in NATS,
// and defines the topic of the message.

export enum Subjects {
  TicketCreated = 'ticket-created',
  TicketUpdated = 'ticket-updated',
  OrderCreated = 'order-created',
  OrderCancelled = 'order-cancelled',
  ExpirationComplete = 'expiration-complete',
  PaymentCreated = 'payment-created',
}
