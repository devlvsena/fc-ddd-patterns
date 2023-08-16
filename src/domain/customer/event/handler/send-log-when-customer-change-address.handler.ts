import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerChangedAddressEvent from "../customer-changed-address.event";

export default class SendLogWhenCustomerChangeAddress implements EventHandlerInterface<CustomerChangedAddressEvent> {
    handle(event: CustomerChangedAddressEvent): void {
        const { eventData } = event;
        const {id, nome, address} = eventData;
        console.log(`Endereço do cliente: ${id}, ${nome} alterado para: ${address}`);
    }
}