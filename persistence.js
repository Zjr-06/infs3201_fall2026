import * as mongodb from 'mongodb'

let client = undefined
let db = undefined
async function getDatabase() {
    if (db !== undefined) {
        return db
    }
    client = new mongodb.MongoClient(process.env.MONGODB_URL)
    await client.connect()
    db = client.db("infs3201_fall2026")
    return db
}

/**
 * Reads all services from the database
 * @returns {Array<Object>} The list of services
 */
export async function getServices() {
    let db = await getDatabase()
    let servicesItems = db.collection("services")
    let services = await servicesItems.find()
    return services.toArray()
}

/**
 * Reads all orders from the database
 * @returns {Array<Object>} The list of orders
 */
export async function getOrders() {
    let db = await getDatabase()
    let ordersItems = db.collection("orders")
    let orders = await ordersItems.find()
    return orders.toArray()
}

/**
 * Checks if the service exists
 * @param {String} id - the id of the service
 * @returns {object} service
 */
export async function checkService(id) {
    let db = await getDatabase()
    let servicesItems = db.collection("services")
    let service = await servicesItems.findOne({ serviceId: id })
    return service
}

/**
 * Checks if the customer exists
 * @param {String} id - the id of the customer
 * @returns {object} customer 
 */
export async function checkCustomer(id) {
    let db = await getDatabase()
    let customersItems = db.collection("customers")
    let customer = await customersItems.findOne({ customerId: id })
    return customer
}

/**
 * Checks if the order exists
 * @param {String} id - the id of the order
 * @returns {object} order 
 */
export async function checkOrder(id) {
    let db = await getDatabase()
    let ordersItems = db.collection("orders")
    let order = await ordersItems.findOne({ orderId: id })
    return order
}

/**
 * Reads all the customer's orders
 * @param {String} id - the id of the customer
 * @returns {Array<Object>} orders
 */
export async function getCustomerOrders(id) {
    let db = await getDatabase()
    let ordersItems = db.collection("orders")
    let orders = await ordersItems.find({ customerId: id })
    return orders.toArray()
}

/**
 * Updates an order's status in the database
 * @param {String} id the updated order id
 * @param {String} newStatus the new status
 * @returns {void}
 */
export async function updateOrder(id, newStatus) {
    let db = await getDatabase()
    let ordersItems = db.collection("orders")
    await ordersItems.updateOne({ orderId: id }, { $set: { status: newStatus } })
}

/**
 * Adds an order and rewrites the database
 * @param {Object} order the order to add
 * @returns {void}
 */
export async function addOrder(order) {
    let db = await getDatabase()
    let ordersItems = db.collection("orders")
    await ordersItems.insertOne({
        orderId: order.orderId,
        customerId: order.customerId,
        orderDate: order.orderDate,
        status: order.status,
        items: order.items
    })
}