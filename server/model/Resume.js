const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema({
  name: String,
  contact: String,
  location: String,
  skills: [String],
  experience: String,
  summary: String,
  education: String,
  formattedResume: String,
});

module.exports = mongoose.model("Resume", resumeSchema);
