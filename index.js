const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.your-cluster-uri.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const eventCollection = client.db("socialEventsDB").collection("events");
    const joinedEventCollection = client
      .db("socialEventsDB")
      .collection("joinedEvents");

    app.get("/", (req, res) => {
      res.send("Social Events Server is running!");
    });

    app.get("/api/events/upcoming", async (req, res) => {
      const { search, type } = req.query;

      const query = {
        eventDate: { $gt: new Date().toISOString() },
      };

      if (search) {
        query.title = { $regex: search, $options: "i" };
      }
      if (type && type !== "") {
        query.eventType = type;
      }

      try {
        const events = await eventCollection.find(query).toArray();
        res.send(events);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error fetching upcoming events" });
      }
    });

    app.get("/api/event/:id", async (req, res) => {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid event ID format" });
      }

      const query = { _id: new ObjectId(id) };

      try {
        const event = await eventCollection.findOne(query);
        if (!event) {
          return res.status(404).send({ message: "Event not found" });
        }
        res.send(event);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error fetching event details" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
