const express = require('express')
const app = express()
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000
require('dotenv').config()

app.use(express.json())
app.use(cors())




// console.log(hashPass)
// const salt = bcrypt.genSal


const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.qvnsypp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function hashPass(password) {
    const res = await bcrypt.hash(password, 10)
    return res
}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const usersCollection = client.db('PayKit').collection('users')



        app.post('/users', async (req, res) => {
            const userInfo = req.body;

            const data = {
                name: userInfo.name,
                password: userInfo.password,
                phone: userInfo.phone,
                email: userInfo.email,
                role: userInfo.role,
                action: userInfo.action,
                status: userInfo.status
            }

            console.log('data:', data)


            const checking = await usersCollection.findOne({ phone: userInfo.phone })

            console.log('email:', checking)
            try {
                if (checking && checking.phone === userInfo.phone) {
                    res.send('User already exists')
                } else {
                    const result = await usersCollection.insertOne(data)
                    res.send(result)
                }

            }
            catch {
                res.send('wrong Input')
            }

        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Server is working')
})

app.listen(port, () => {
    console.log(`server on port ${port}`)
})