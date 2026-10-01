import fs from "fs/promises"

/**
 * Reads all services from services.json
 * @returns {Array<Object>} The list of services
 */
export async function getServices() {
    let servicesDataBuffer = await fs.readFile("services.json", "utf-8")
    let services = JSON.parse(servicesDataBuffer)
    return services
}

/**
 * Reads all customers from customers.json
 * @returns {Array<Object>} The list of customers
 */
async function getCustomers() {
    let customersDataBuffer = await fs.readFile("customers.json", "utf-8")
    let customers = JSON.parse(customersDataBuffer)
    return customers
}

/**
 * Reads all orders from orders.json
 * @returns {Array<Object>} The list of orders
 */
export async function getOrders() {
    let ordersDataBuffer = await fs.readFile("orders.json", "utf-8")
    let orders = JSON.parse(ordersDataBuffer)
    return orders
}

/**
 * Checks if the service exists
 * @param {number} id - the id of the service
 * @returns {object} service
 */
export async function checkService(id) {
    let services = await getServices()
    for (let service of services) {
        if (id === service.serviceId) {
            return service;
        }
    }
    return false
}

/**
 * Checks if the customer exists
 * @param {number} id - the id of the customer
 * @returns {object} customer 
 */
export async function checkCustomer(id) {
    let customers = await getCustomers()
    for (let customer of customers) {
        if (id === customer.customerId) {
            return customer;
        }
    }
    return false
}

/**
 * Checks if the order exists
 * @param {number} id - the id of the order
 * @returns {object} order 
 */
export async function checkOrder(id) {
    let orders = await getOrders()
    for (let order of orders) {
        if (id === order.orderId) {
            return order
        }
    }
    return false
}

/**
 * Reads all the customer's orders
 * @param {number} id - the id of the customer
 * @returns {Array<Object>} orders
 */
export async function getCustomerOrders(id) {
    let orders = await getOrders()
    let customerOrders = []
    for (let order of orders) {
        if (order.customerId === id) {
            customerOrders.push(order)
        }
    }
    return customerOrders
}

/**
 * Updates an order's status in orders.json
 * @param {Object} updatedOrder the updated order
 * @param {String} newStatus the new status
 * @returns {void}
 */
export async function updateOrder(updatedOrder, newStatus) {
    let orders = await getOrders()
    for (let order of orders) {
        if(order.orderId === updatedOrder.orderId){
            order.status = newStatus
        }
    }
    let output = JSON.stringify(orders, null, 4)
    await fs.writeFile("orders.json", output)
}

/**
 * Adds an order and rewrites orders.json
 * @param {Object} order the order to add
 * @returns {void}
 */
export async function addOrder(order) {
    let orders = await getOrders()
    orders.push(order)
    let output = JSON.stringify(orders, null, 4)
    await fs.writeFile("orders.json", output)
}