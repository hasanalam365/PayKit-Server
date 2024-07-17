const express = require('express')
const app = express()
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const res = await bcrypt.hash(password, 10);
    return res;
}

async function comparePasswords(plainPassword, hashedPassword) {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
}

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const usersCollection = client.db('PayKit').collection('users')

        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray()
            res.send(result)
        })

        app.get('/user/:phone/:pass', async (req, res) => {
            const phone = req.params.phone;
            const pass = req.params.pass;

            const checkUser = await usersCollection.findOne({ phone: phone })

            if (!checkUser) {
                return res.send({ message: 'unauthorized access' })
            }

            const passIsMatch = await bcrypt.compare(pass, checkUser.password)

            if (!passIsMatch) {
                return res.send({ message: 'unauthorized access' })
            }





            const result = await usersCollection.findOne({ phone: phone })

            if (result) {
                res.send(result)
            }





        })


        app.post('/users', async (req, res) => {
            const userInfo = req.body;


            try {

                const hashedPassword = await hashPass(userInfo.password);


                const data = {
                    name: userInfo.name,
                    password: hashedPassword,
                    phone: userInfo.phone,
                    email: userInfo.email,
                    role: userInfo.role,
                    action: userInfo.action,
                    status: userInfo.status,
                    balance: 0
                }




                const checking = await usersCollection.findOne({ phone: userInfo.phone })



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

        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const role = req.body;



            const query = { _id: new ObjectId(id) }

            const updatedDoc = {
                $set: {
                    role: role.role
                }
            }

            const result = await usersCollection.updateOne(query, updatedDoc)
            res.send(result)

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