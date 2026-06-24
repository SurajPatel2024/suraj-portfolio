import { setServers } from "node:dns/promises";
try { setServers(["8.8.8.8", "8.8.4.4"]); } catch (e) {}

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors({ origin: "*" })); // Sabhi origins allow kiye
app.use(express.json());

// Schema
const Project = mongoose.model('Project', new mongoose.Schema({
    title: String, description: String, category: String, image: String, link: String
}, { timestamps: true }));

// Admin Auth
const authAdmin = (req, res, next) => {
    if (req.headers['admin-password'] !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Auth Failed" });
    }
    next();
};
 
// Routes
app.get('/api/projects', async (req, res) => {
    try { res.json(await Project.find().sort({ createdAt: -1 })); }
    catch (err) { res.status(500).json({ message: err.message }); }
});

app.post('/api/projects', authAdmin, async (req, res) => { 
    try { res.status(201).json(await new Project(req.body).save()); }
    catch (err) { res.status(400).json({ message: err.message }); }
});
// ✅ Sahi Routes ka pattern
app.put('/api/projects/:id', authAdmin, async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProject);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

app.delete('/api/projects/:id', authAdmin, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
});


const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});
 
mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });