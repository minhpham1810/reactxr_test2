// MongoDB/Express API for lessons and exercises
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Configure CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const MONGO_URI = process.env.MONGO_URI || "";
const DB_NAME = "reactxr_lessons";
const COLLECTION = "exercises";

let db, exercises;

MongoClient.connect(MONGO_URI)
  .then((client) => {
    db = client.db(DB_NAME);
    exercises = db.collection(COLLECTION);
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

function ensureDb(req, res, next) {
  if (!exercises) {
    return res
      .status(503)
      .json({ error: "Database not connected yet. Please try again." });
  }
  next();
}
// Apply database check middleware to API routes
app.use("/api", ensureDb);

// Create a new exercise
app.post("/api/exercises", async (req, res) => {
  try {
    const exercise = req.body;
    const result = await exercises.insertOne(exercise);
    res.status(201).json({ _id: result.insertedId, ...exercise });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all exercises
app.get("/api/exercises", async (req, res) => {
  try {
    const all = await exercises.find().toArray();
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single exercise by ID
app.get("/api/exercises/:exerciseId", async (req, res) => {
  try {
    let objectId;
    try {
      objectId = new ObjectId(req.params.exerciseId);
    } catch (e) {
      return res.status(400).json({ error: "Invalid exercise ID format" });
    }

    const exercise = await exercises.findOne({ _id: objectId });
    if (!exercise) return res.status(404).json({ error: "Exercise not found" });
    res.json(exercise);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Update an exercise
app.put("/api/exercises/:exerciseId", async (req, res) => {
  try {
    const update = req.body;
    let objectId;
    try {
      objectId = new ObjectId(req.params.id);
    } catch (e) {
      return res.status(400).json({ error: "Invalid ObjectId" });
    }
    // Try to update by ObjectId
    const result = await exercises.findOneAndUpdate(
      { _id: objectId },
      { $set: update },
      { returnDocument: "after", upsert: true }
    );
    if (!result || !result.value) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(result.value);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete an exercise
app.delete("/api/exercises/:exerciseId", async (req, res) => {
  try {
    let objectId;
    try {
      objectId = new ObjectId(req.params.exerciseId);
    } catch (e) {
      return res.status(400).json({ error: "Invalid exercise ID format" });
    }

    const result = await exercises.deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Exercise not found" });
    }
    res.json({ success: true, message: "Exercise deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
