// Event Hub (Azure Event Hubs) / Subject (NATS):
// A stream of events, which can be hierarchical in NATS,
// and defines the topic of the message.

export enum EventHubs {
  Payments = 'payments-service',
  Tickets = 'ticketing-service',
  Orders = 'orders-service',
  Expiration = 'expiration-service',
}
