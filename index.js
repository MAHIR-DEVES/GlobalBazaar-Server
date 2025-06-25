const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const admin = require('firebase-admin');
const decoded = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString(
  'utf-8'
);
const serviceAccount = JSON.parse(decoded);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = process.env.PORT || 3000;

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

app.use(
  cors({
    origin: [
      'https://windy-cast.surge.sh',
      'http://localhost:5173',
      'https://storied-bavarois-820863.netlify.app',
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.csfnsag.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// jwt middlewares
const verifyJWT = async (req, res, next) => {
  const token = req?.headers?.authorization?.split(' ')[1];

  if (!token) return res.status(401).send({ message: 'Unauthorize Access' });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.tokenEmail = decoded.email;

    next();
  } catch (err) {
    console.log(err);

    return res.status(401).send({ message: 'Unauthorize Access' });
  }
};

async function run() {
  try {
    const productCollection = client.db('globalBazaar').collection('Products');
    const categoryCollection = client.db('globalBazaar').collection('category');
    const orderCollection = client.db('globalBazaar').collection('order');
    const slideCollection = client.db('globalBazaar').collection('slide');

    // generate jwt
    app.post('/jwt', (req, res) => {
      const user = { email: req.body.email };

      // token creation
      const token = jwt.sign(user, process.env.JWT_SECRET_KEY, {
        expiresIn: '7d',
      });

      res
        .cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        })
        .send({ message: 'jwt created successfully' });
    });

    app.post('/products', verifyJWT, async (req, res) => {
      const newPost = req.body;
      const result = await productCollection.insertOne(newPost);
      res.send(result);
    });

    //
    app.get('/categories', async (req, res) => {
      const result = await categoryCollection.find().limit(8).toArray();
      res.send(result);
    });

    // get marque data
    app.get('/get-allProducts-autoPaly', verifyJWT, async (res, req) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    // filterCategory
    app.get('/filterCategory', async (req, res) => {
      const category = req.query.category;

      try {
        const filteredProducts = await productCollection
          .find({ category: category })
          .toArray();
        res.send(filteredProducts);
      } catch (error) {
        console.error('Error fetching filtered products:', error);
        res.status(500).send({ message: 'Internal Server Error' });
      }
    });

    // get all category
    app.get('/all-categories', async (req, res) => {
      const result = await categoryCollection.find().toArray();
      res.send(result);
    });

    // get all product
    app.get('/get-allProduct', verifyJWT, async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    // filter product by quantity
    app.get('/filter-product', verifyJWT, async (req, res) => {
      try {
        const result = await productCollection
          .aggregate([
            {
              $match: {
                $expr: {
                  $gt: [{ $toInt: '$minSellingQuantity' }, 100],
                },
              },
            },
          ])
          .toArray();
        res.send(result);
      } catch (error) {
        console.error('Error filtering products:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.get('/get-allProducts', verifyJWT, async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    // for home marquee
    app.get('/get-allProducts-forSlide', async (req, res) => {
      const result = await slideCollection.find().toArray();
      res.send(result);
    });

    //product details
    app.get('/singleProduct/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      try {
        const product = await productCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!product) {
          return res.status(404).send({ message: 'Post not found' });
        }

        res.send(product);
      } catch (error) {
        res.status(500).send({ message: 'Error fetching post', error });
      }
    });
    //product details for update
    app.get('/singleProductUpdate/:id', async (req, res) => {
      const id = req.params.id;
      try {
        const product = await productCollection.findOne({
          _id: new ObjectId(id),
        });
        if (!product) {
          return res.status(404).send({ message: 'Post not found' });
        }

        res.send(product);
      } catch (error) {
        res.status(500).send({ message: 'Error fetching post', error });
      }
    });

    // my product
    app.get('/my-products', verifyJWT, async (req, res) => {
      const email = req.query.email;
      const result = await productCollection.find({ email }).toArray();
      res.send(result);
    });

    // delete myProduct
    app.delete('/myProduct/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // updated my products
    app.put('/updatedProduct/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;

      try {
        const result = await productCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: data }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: 'Product not found' });
        }

        res.send({
          modifiedCount: result.modifiedCount,
          message:
            result.modifiedCount > 0
              ? 'Product updated successfully'
              : 'No changes were made',
        });
      } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send({ message: 'Error updating product' });
      }
    });

    //  save order
    app.post('/orders', async (req, res) => {
      const orderData = req.body;
      const result = await orderCollection.insertOne(orderData);
      res.send(result);
    });

    // update Quantity
    app.patch('/updateQuantity/:id', async (req, res) => {
      const id = req.params.id;
      const { updateQuantity } = req.body;
      const { sellQuantity } = updateQuantity;

      try {
        const product = await productCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!product) {
          return res.status(404).json({ error: 'product not found' });
        }

        const currentQuantity = parseInt(product.quantity);
        const sellQty = parseInt(sellQuantity);

        if (currentQuantity < sellQty) {
          return res.status(400).json({ error: 'out of stoke' });
        }

        const updateResult = await productCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { quantity: currentQuantity - sellQty } }
        );
      } catch (err) {
        console.error('update', err);
      }
    });

    // add update quantity
    app.patch('/addUpdateQuantity/:id', async (req, res) => {
      const id = req.params.id;
      const { updateQuantity } = req.body;
      const { quantity } = updateQuantity;

      try {
        const product = await productCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!product) {
          return res.status(404).json({ error: 'product not found' });
        }

        const currentQuantity = parseInt(product.quantity);
        const addQuantity = parseInt(quantity);

        if (currentQuantity < addQuantity) {
          return res.status(400).json({ error: 'out of stoke' });
        }

        const updateResult = await productCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { quantity: currentQuantity + addQuantity } }
        );
        res.send(updateResult);
      } catch (err) {
        console.error('update', err);
        res.status(500).send({ message: err.message });
      }
    });

    // get order
    app.get('/getAllOrder/:email', verifyJWT, async (req, res) => {
      const decodedEmail = req.tokenEmail;
      const email = req.params.email;

      if (decodedEmail !== email) {
        return res.status(403).send({ message: 'Forbidden Access' });
      }
      const filter = { customerEmail: email };
      const allOrders = await orderCollection.find(filter).toArray();

      for (const order of allOrders) {
        const orderId = order.orderId;

        const fullOrderData = await productCollection.findOne({
          _id: new ObjectId(orderId),
        });
        order.name = fullOrderData.name;
        order.photo = fullOrderData.imageUrl;
        order.brand = fullOrderData.brand;
        order.category = fullOrderData.category;
        order.price = fullOrderData.price;
      }
      res.send(allOrders);
    });

    // delete orders
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.send(result);
    });

    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send(' GlobalBazaar Server is running!');
});

app.listen(port, () => {
  console.log(`server in running on port ${port} `);
});
