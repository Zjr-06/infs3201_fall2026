import * as persistence from "./persistence.js"

const MINIMUM_ORDER_CHARGE = Number(process.env.MINIMUM_ORDER_CHARGE) || 0
const FREE_DELIVERY_THRESHOLD = Number(process.env.FREE_DELIVERY_THRESHOLD) || 0
const DELIVERY_CHARGE = Number(process.env.DELIVERY_CHARGE) || 0

/**
 * Reads all services from the database
 * @returns {Array<Object>} services 
 */
export async function getServices() {
    let services = await persistence.getServices()
    return services
}

/**
 * Reads all orders from the database
 * @returns {Array<Object>} orders 
 */
export async function getOrders() {
    let orders = await persistence.getOrders()
    return orders
}

/**
 * Checks if the service exists
 * @param {String} id - the id of the service
 * @returns {object} service
 */
export async function checkService(id) {
    return persistence.checkService(id)
}

/**
 * Checks if the customer exists
 * @param {String} id - the id of the customer
 * @returns {object} customer 
 */
export async function checkCustomer(id) {
    return persistence.checkCustomer(id)
}

/**
 * Checks if the order exists
 * @param {String} id - the id of the order
 * @returns {object} order 
 */
export async function checkOrder(id) {
    return persistence.checkOrder(id)
}

/**
 * Reads all the customer's orders
 * @param {String} id - the id of the customer
 * @returns {Array<Object>} orders
 */
export async function getCustomerOrders(id) {
    return persistence.getCustomerOrders(id)
}

/**
 * gets the total prices of all services of an order
 * @param {object} order - the order to get the total price of
 * @returns {number} total 
 */
export async function getTotal(order) {
    let total = 0
    for (let item of order.items) {
        let service = await checkService(item.serviceId)
        total += service.price * item.quantity
    }
    if (total < MINIMUM_ORDER_CHARGE){
        total = MINIMUM_ORDER_CHARGE
    }
    if (total < FREE_DELIVERY_THRESHOLD){
        total += DELIVERY_CHARGE
    }
    return total.toFixed(2)
}
/**
 * gets the total prices of all services of an order
 * @param {object} order - the order to get the total price of
 * @returns {object} result 
 */
export async function getSubTotal(order) {
    let total = 0
    let result = {"subtotal": 0,"adjustment": 0, "delivery": 0}
    for (let item of order.items) {
        let service = await checkService(item.serviceId)
        total += service.price * item.quantity
    }
    result.subtotal = total.toFixed(2)
    if (total < MINIMUM_ORDER_CHARGE){
        result.adjustment = MINIMUM_ORDER_CHARGE - total.toFixed(2)
    }
    if (total < FREE_DELIVERY_THRESHOLD){
        result.delivery = DELIVERY_CHARGE
    }
    return result
}

/**
 * validates the update
 * @param {object} order - the order
 * @param {String} newStatus - the new status
 * @returns {Boolean} True/False depending if the update is valid or not  
 */
export async function statusUpdate(order, newStatus) {
    let accepted = false
    if (order.status === "Received" && (newStatus === "Washing" || newStatus === "Ready" || newStatus === "Delivered")){
        accepted = true
    }
    else if (order.status === "Washing" && (newStatus === "Ready" || newStatus === "Delivered")){
        accepted = true
    }
    else if (order.status === "Ready" && newStatus === "Delivered"){
        accepted = true
    }
    if(accepted){
        await persistence.updateOrder(order.orderId,newStatus)
        return true
    }
    else{
        return false
    }
}

/**
 * Finds latest order id and creates a new one
 * @returns {String} The value of the new order id
 */
async function newOrderId() {
    let orders = await persistence.getOrders()
    let latest = 0
    for (let order of orders){
        let num = Number(String(order.orderId).slice(1))
        if (num > latest){
            latest = num
        }
    }
    latest +=1
    return ("O" + "0".repeat(3-String(latest).length)+ latest)
}

/**
 * Creates a new order
 * @param {String} id - the id of the customer
 * @param {Array<Object>} items - the items of the order
 * @returns {object} the new order
 */
export async function newOrder(id,items) {
    let newItems = []
    for (let i = 0; i < items.length; i++){
        let found = false
        for (let j = 0; j < newItems.length; j++){
            if (items[i].serviceId === newItems[j].serviceId) {
                newItems[j].quantity += items[i].quantity
                found = true
            }
        }
        if(!found){
            newItems.push(items[i])
        }
    }
    let newOrder = {"orderId":await newOrderId(),"customerId": id,"orderDate": new Date().toISOString().split("T")[0],"status": "Received","items": newItems}
    await persistence.addOrder(newOrder)
    return newOrder
}