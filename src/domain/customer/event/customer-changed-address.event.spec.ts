import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerChangedAddressEvent from "./customer-changed-address.event";
import SendLogWhenCustomerChangeAddress from "./handler/send-log-when-customer-change-address.handler";

describe("Domain created customer event handlers tests", () => {
  it("should notify all created customer event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventCustomerChangedAddressHandler = new SendLogWhenCustomerChangeAddress();
    const spyEventCustomerChangedAddressHandler = jest.spyOn(eventCustomerChangedAddressHandler, "handle");

    eventDispatcher.register("CustomerChangedAddressEvent", eventCustomerChangedAddressHandler);

    expect(eventDispatcher.getEventHandlers["CustomerChangedAddressEvent"][0]).toMatchObject(eventCustomerChangedAddressHandler);

    const customerChangedAddressEvent = new CustomerChangedAddressEvent({
        id: "1",
        name: "Fulano",
        address: "Rua fulano de tal, numero xpto"
    });

    eventDispatcher.notify(customerChangedAddressEvent);

    expect(spyEventCustomerChangedAddressHandler).toHaveBeenCalled();
  });
});
