const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('Doctore Portal server Running')

})
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.kl0ltne.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const doctorCollection = client.db('doctorPortal').collection('appointmentOptions')
        const bookingsCollection = client.db('doctorPortal').collection('bookings')
        app.get('/appointmentOptions', async (req, res) => {
            const date = req.query.date
            console.log(date)
            const query = {}
            const Options = await doctorCollection.find(query).toArray()
            const booking = { appointmentDate: date }
            const allreadyBook = await bookingsCollection.find(booking).toArray()
            console.log(allreadyBook)
            Options.forEach(option => {
                const optionBook = allreadyBook.filter(book => book.treatment === option.name)
                const bookSlots = optionBook.map(book => book.slot)
                const remaingSlot = option.slots.filter(slot => !bookSlots.includes(slot))
                option.slots = remaingSlot
            })
            res.send(Options)
        })
        app.post('/bookings', async (req, res) => {
            const booking = req.body
            console.log(booking)
            const query = {
                appointmentDate: booking.appointmentDate,
                treatment: booking.treatment,
                email: booking.email
            }
            const alreadyBook = await bookingsCollection.find(query).toArray()
            if (alreadyBook.length) {
                const message = `You Already have a Booking on ${booking.appointmentDate}`
                return res.send({ acknowledged: false, message })
            }
            const result = await bookingsCollection.insertOne(booking)
            res.send(result)
        })
    }
    finally {

    }
}
run().catch(err => console.log(err))


//appointmentOptions,doctorPortal
app.listen(port, () => {
    console.log('Doctore Server is Running', port)
})