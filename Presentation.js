import promptSync from "prompt-sync"
import * as business from "./business.js"
import "dotenv/config"
const prompt = promptSync()

while (true) {
    console.log("\n1. Show laundry services")
    console.log("2. View customer orders")
    console.log("3. Update order status")
    console.log("4. Create new order")
    console.log("5. View invoice")
    console.log("6. Exit\n")
    let choice = prompt("What is your choice> ")

    if (choice === "1") {
        let services = await business.getServices()
        console.log("Service ID  Service                    Unit  Price")
        console.log("----------  -------------------------  ----  -----")
        for (let service of services) {
            console.log(service.serviceId.padEnd(12) + service.name.padEnd(27) + service.unit.padEnd(6) + service.price.toFixed(2).padStart(5))
        }
    }

    else if (choice === "2") {
        let id = prompt("Enter customerID: ")
        let customer = await business.checkCustomer(id)
        if (customer) {
            console.log("Orders for " + customer.name + "\n")
            console.log("Order ID  Order Date    Status       Total")
            console.log("--------  ----------    ---------    --------")
            let customerOrders = await business.getCustomerOrders(id)
            for (let order of customerOrders) {
                console.log(order.orderId.padEnd(10) + order.orderDate.padEnd(14) + order.status.padEnd(13) + (await business.getTotal(order)).padStart(8))
            }
        }
        else {
            console.log("Sorry! Customer ID not found")
        }
    }

    else if (choice === "3") {
        let id = prompt("Enter order ID: ")
        let order = await business.checkOrder(id)
        if (order) {
            console.log("Current status: " + order.status)
            let newStatus = prompt("Enter new status: ")
            if (await business.statusUpdate(order, newStatus)) {
                console.log("Order status updated")
            }
            else {
                console.log("Order status can't be updated")
            }

        }
        else {
            console.log("Sorry! Order ID not found")
        }
    }

    else if (choice === "4") {
        let id = prompt("Enter customer ID: ")
        if (await business.checkCustomer(id)) {
            let items = []
            while (true) {
                let serviceId = prompt("Enter service ID (blank to finish): ")
                if (serviceId === "") {
                    break
                }
                else if (await business.checkService(serviceId)) {
                    let quantity = Number(prompt("Enter quantity: "))
                    items.push({ serviceId, quantity })
                }
                else {
                    console.log("Sorry! Service not found")
                }
            }
            let newOrder = await business.newOrder(id, items)
            console.log("Order " + newOrder.orderId + " created")
            console.log("Total price: " + await business.getTotal(newOrder) + " QAR")
        }
        else {
            console.log("Sorry! Customer not found")
        }
    }

    else if (choice === "5") {
        let id = prompt("Enter order ID: ")
        let order = await business.checkOrder(id)
        if (order) {
            let customer = await business.checkCustomer(order.customerId)
            if (customer) {
                console.log(("Order: " + order.orderId).padEnd(19) + ("Date: " + order.orderDate).padEnd(24) + "Status: " + order.status)
            console.log("Customer: " + customer.name)
            console.log("Service                    Qty       Price       Line Total")
            console.log("-------------------------  --------  ----------  ----------")
            for (let item of order.items) {
                let service = await business.checkService(item.serviceId)
                console.log(service.name.padEnd(27) + String(item.quantity).padEnd(10) + service.price.toFixed(2).padStart(10) + (item.quantity * service.price).toFixed(2).padStart(12))
            }
            let result = await business.getSubTotal(order)
            console.log("\n"+"Service subtotal:".padEnd(40) + Number(result.subtotal).toFixed(2).padStart(19))
            console.log("Minimum-order adjustment:".padEnd(40) + Number(result.adjustment).toFixed(2).padStart(19))
            console.log("Delivery charge:".padEnd(40) + Number(result.delivery).toFixed(2).padStart(19))
            console.log("Final total:".padEnd(40) + (await business.getTotal(order)).padStart(19)+" QAR")
            }
            else{
                console.log("Sorry! Customer not found")
            }
        }
        else{
            console.log("Sorry! Order ID not found")
        }

    }

    else if (choice === "6") {
        break
    }

    else {
        console.log("Invalid Option")
    }
}
