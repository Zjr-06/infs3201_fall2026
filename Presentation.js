import "dotenv/config"
import express from "express"
import * as handlebars from "express-handlebars"
import * as business from "./business.js"

const app = express()
const port = 8000
app.engine("handlebars", handlebars.engine())
app.set("view engine", "handlebars")
app.set("views", "./views")
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))

app.get(`/`, async (req, res) => {
    res.render('landing.handlebars')
})

app.get(`/services`, async (req, res) => {
    let services = await business.getServices()
    res.render('services.handlebars', { services: services })
})

app.get(`/customer`, async (req, res) => {
    res.render('findCustomers.handlebars',)
})

app.get(`/orders`, async (req, res) => {
    let orders = await business.getOrders()
    let ordersList = []
    for (let order of orders) {
        let customer = await business.checkCustomer(order.customerId)
        ordersList.push({
            orderId:order.orderId,
            customerId:order.customerId,
            orderDate:order.orderDate,
            status:order.status,
            customerName:customer.name})
    }
    res.render('orders.handlebars', {ordersList:ordersList})
})

app.get(`/find-result`, async (req, res) => {
    let id = req.query.customer_id
    let customer = await business.checkCustomer(id)
    let customerOrders = []
    if (customer) {
        let orders = await business.getCustomerOrders(id)
        for (let order of orders) {
            customerOrders.push({orderId:order.orderId, orderDate:order.orderDate, status:order.status, total: await business.getTotal(order) })
        }
    }
    res.render('customer.handlebars', { customer, customerOrders })
})

app.get(`/update-status`, async (req, res) => {
    let order = await business.checkOrder(req.query.order)
    res.render('update.handlebars', {order})
})

app.post(`/update-status`, async (req, res) => {
    let order = await business.checkOrder(req.body.orderId)
    if (await business.statusUpdate(order, req.body.status)) {
        res.redirect(`/orders`)
    }
    else{
        res.send("<p>Invalid Status</p>")
    }
})

app.use((req,res) => {
    res.render("error.handlebars")
})

app.listen(port)
