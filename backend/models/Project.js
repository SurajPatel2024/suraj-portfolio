import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // mern, gaming, tools, frontend
  image: { type: String, required: true },     // Image URL
  link: { type: String, required: true }       // Live Project URL
}, { timestamps: true });

export const Project = mongoose.model('Project', projectSchema);
