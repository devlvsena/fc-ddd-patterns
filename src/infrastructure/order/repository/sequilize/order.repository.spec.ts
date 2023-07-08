import { Sequelize } from "sequelize-typescript";
import { v4 } from "uuid";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should find a order", async () => {
    const orderRepository = new OrderRepository();
    const customerRepository = new CustomerRepository();
    const productRepository = new ProductRepository();

    // customer
    const customer = new Customer("c1", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    // product
    const product1 = new Product("p1", "Product 1", 10);
    const product2 = new Product("p2", "Product 2", 20);
    await productRepository.create(product1);
    await productRepository.create(product2);

    const item1: OrderItem = new OrderItem("o1", "item1", 10, "p1", 1);
    const item2: OrderItem = new OrderItem("o2", "item2", 20, "p2", 2);
    const items: OrderItem[] = [item1, item2];
    const order: Order = new Order("abc123", "c1", items);

    await orderRepository.create(order);

    const orderResult = await orderRepository.find("abc123");
    expect(order).toStrictEqual(orderResult);
  });

  it("should throw an error when order is not found", async () => {
    const orderRepository = new OrderRepository();
    expect(async () => {
      await orderRepository.find("12321");
    }).rejects.toThrow("Order not found");
  });

  it("should find all orders", async () => {
    const orderRepository = new OrderRepository();
    const customerRepository = new CustomerRepository();
    const productRepository = new ProductRepository();

    // customer
    const customer = new Customer("c1", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    // product
    const product1 = new Product("p1", "Product 1", 10);
    const product2 = new Product("p2", "Product 2", 20);
    await productRepository.create(product1);
    await productRepository.create(product2);

    const item1: OrderItem = new OrderItem("o1", "item1", 10, "p1", 1);
    const item2: OrderItem = new OrderItem("o2", "item2", 20, "p2", 2);
    const order1: Order = new Order("abc123", "c1", [item1]);
    const order2: Order = new Order("4441", "c1", [item2]);

    await orderRepository.create(order1);
    await orderRepository.create(order2);

    const orders = await orderRepository.findAll();

    expect(orders).toHaveLength(2);
    expect(orders).toContainEqual(order1);
    expect(orders).toContainEqual(order2);
  });

  it("should update a order", async () => {
    const orderRepository = new OrderRepository();
    const customerRepository = new CustomerRepository();
    const productRepository = new ProductRepository();

    // customer
    const customer = new Customer(v4(), "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    // product
    const product = new Product(v4(), "Product 1", 10);
    const product2 = new Product(v4(), "Product 2", 20);
    await productRepository.create(product);
    await productRepository.create(product2);

    // order
    const orderItem = new OrderItem(
      v4(),
      product.name,
      product.price,
      product.id,
      2
    );

    const orderItem2 = new OrderItem(
      v4(),
      product2.name,
      product2.price,
      product2.id,
      2
    );
    const order = new Order(v4(), customer.id, [orderItem]);
    await orderRepository.create(order);

    order.addItem(orderItem2);

    await orderRepository.update(order);
    const orderResult = await orderRepository.find(order.id);

    expect(order.total()).toEqual(orderResult.total());
    expect(order.items.length).toEqual(orderResult.items.length);
    expect(order).toStrictEqual(orderResult);
  });
});
