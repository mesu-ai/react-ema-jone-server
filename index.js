const express=require('express');
const { MongoClient } = require("mongodb");
const cors= require('cors');
const { query } = require('express');
require('dotenv').config()

const app=express();
const port=process.env.PORT ||5000;

// midleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xwx5o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('ema-jone');
        const productCollection = database.collection('products');
        const orderCollection=database.collection('order');
           
        // console.log('connect to db..');

        app.get('/products',async(req,res)=>{
            const cursor=productCollection.find({});
            const page=req.query.page;
            const size=parseInt(req.query.size);
            const count=await cursor.count();
            
            let products;
            if(page){
                products=await cursor.skip(page*size).limit(size).toArray();

            }else{
                products=await cursor.toArray();

            }

            res.send({
                count,
                products,
            });

        });

        // post data by keys
            app.post('/products/byKeys',async(req,res)=>{
            const keys=req.body;
            const quary={key:{$in:keys}};
            const products=await productCollection.find(quary).toArray();
            res.json(products);
        });

        
        //add orders api

        app.post('/orders',async(req,res)=>{
            const order=req.body;
            const result=await orderCollection.insertOne(order);
            res.json(result);
        })




    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    console.log('db starting...');
    res.send('connecting...');

});

app.listen(port,(req,res)=>{
    console.log('connect to port: ',port);

});