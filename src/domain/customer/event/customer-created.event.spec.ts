import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerCreatedEvent from "../../customer/event/customer-created.event";
import SendLogWhenCustomerIsCreated1 from "../../customer/event/handler/send-log-when-customer-is-created-1.handler";
import SendLogWhenCustomerIsCreated2 from "./handler/send-log-when-customer-is-created-2.handler";

describe("Domain created customer event handlers tests", () => {
  it("should notify all created customer event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventCustomerCreatedConsoleLog1Handler = new SendLogWhenCustomerIsCreated1();
    const eventCustomerCreatedConsoleLog2Handler = new SendLogWhenCustomerIsCreated2();
    const spyEventCustomerCreatedConsoleLog1Handler = jest.spyOn(eventCustomerCreatedConsoleLog1Handler, "handle");
    const spyEventCustomerCreatedConsoleLog2Handler = jest.spyOn(eventCustomerCreatedConsoleLog2Handler, "handle");

    eventDispatcher.register("CustomerCreatedEvent", eventCustomerCreatedConsoleLog1Handler);
    eventDispatcher.register("CustomerCreatedEvent", eventCustomerCreatedConsoleLog2Handler);

    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]).toMatchObject(eventCustomerCreatedConsoleLog1Handler);
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]).toMatchObject(eventCustomerCreatedConsoleLog2Handler);

    const customerCreatedEvent = new CustomerCreatedEvent({
        id: "1",
        name: "Fulano"
    });

    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEventCustomerCreatedConsoleLog1Handler).toHaveBeenCalled();
    expect(spyEventCustomerCreatedConsoleLog2Handler).toHaveBeenCalled();
  });
});
