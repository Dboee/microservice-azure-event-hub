import { Listener } from './base-listener';
import {
  EventHubConsumerClient,
  PartitionContext,
  ReceivedEventData,
} from '@azure/event-hubs';

// const getPartitionIds = async (client: EventHubConsumerClient) => {
//   const partitionIds = await client.getPartitionIds();
//   console.log('Available partitions:', partitionIds);
// };

class TicketCreatedListener extends Listener {
  consumerGroup = 'payments-service'; // consumerGroup, not queueGroupName
  constructor() {
    super();
    this.consumerClient = this.setConsumerClient();
    // getPartitionIds(this.consumerClient);
  }
  onMessage(data: any, context: PartitionContext, msg: ReceivedEventData) {
    // Do something with the event data
    console.log(
      data.sequenceNumber,
      'name: ' + data.body.title,
      'price: ' + data.body.price
    );
    // console.log('context: ', context);
    console.log('msg: ', msg);
    console.log('data: ', data);

    // Acknowledge the event
    context.updateCheckpoint(msg);
  }
}

export { TicketCreatedListener };
