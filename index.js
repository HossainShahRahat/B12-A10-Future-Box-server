const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@b12-a10-future-box-serv.asxjjou.mongodb.net/?appName=b12-a10-future-box-server`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const verifyToken = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];

  if (!idToken) {
    return res.status(401).send({ message: "Unauthorized access" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).send({ message: "Invalid token" });
  }
};

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

    app.post("/api/events", verifyToken, async (req, res) => {
      const eventData = req.body;
      const userEmail = req.user.email;

      if (eventData.creatorEmail !== userEmail) {
        return res.status(403).send({ message: "Forbidden. Email mismatch." });
      }

      try {
        const result = await eventCollection.insertOne(eventData);
        res.send(result);
      } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).send({ message: "Failed to create event" });
      }
    });

    app.get("/api/my-events", verifyToken, async (req, res) => {
      const userEmail = req.query.email;
      const tokenEmail = req.user.email;

      if (userEmail !== tokenEmail) {
        return res
          .status(403)
          .send({ message: "Forbidden access. Email does not match token." });
      }

      const query = { creatorEmail: userEmail };
      try {
        const events = await eventCollection.find(query).toArray();
        res.send(events);
      } catch (error) {
        console.error("Error fetching user events:", error);
        res.status(500).send({ message: "Failed to fetch user events" });
      }
    });

    app.put("/api/event/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const updatedEventData = req.body;
      const userEmail = req.user.email;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid event ID" });
      }

      const filter = { _id: new ObjectId(id) };

      try {
        const event = await eventCollection.findOne(filter);
        if (!event) {
          return res.status(404).send({ message: "Event not found" });
        }

        if (event.creatorEmail !== userEmail) {
          return res
            .status(403)
            .send({ message: "Forbidden. You are not the creator." });
        }

        const updateDoc = {
          $set: {
            title: updatedEventData.title,
            description: updatedEventData.description,
            eventType: updatedEventData.eventType,
            thumbnail: updatedEventData.thumbnail,
            location: updatedEventData.location,
            eventDate: updatedEventData.eventDate,
          },
        };

        const result = await eventCollection.updateOne(filter, updateDoc);
        res.send(result);
      } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).send({ message: "Failed to update event" });
      }
    });

    app.delete("/api/event/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const userEmail = req.user.email;

      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ message: "Invalid event ID" });
      }

      const filter = { _id: new ObjectId(id) };

      try {
        const event = await eventCollection.findOne(filter);
        if (!event) {
          return res.status(404).send({ message: "Event not found" });
        }

        if (event.creatorEmail !== userEmail) {
          return res
            .status(403)
            .send({ message: "Forbidden. You are not the creator." });
        }

        const result = await eventCollection.deleteOne(filter);
        res.send(result);
      } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).send({ message: "Failed to delete event" });
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
