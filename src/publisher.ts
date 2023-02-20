import { TicketCreatedPublisher } from './events/ticket-created-publisher';

async function main() {
  console.clear();

  const publisher = new TicketCreatedPublisher();
  publisher.publish({
    id: 'j1238912hu312i3',
    title: 'Karpe: Amsterdam',
    price: 1500,
  });
}

main().catch((err) => {
  console.log('Error occurred: ', err);
});
