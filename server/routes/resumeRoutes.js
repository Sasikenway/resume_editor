const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse'); // For PDF files
const { parseDocx } = require('mammoth'); // For DOCX files
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Setup multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory temporarily
const upload = multer({ storage: storage });

// Sample model resume format
const modelResumeFormat = {
  name: '',
  contact: '',
  summary: '',
  education: [],
  experience: [],
  skills: [],
};

// Route for uploading resumes
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
      // Check if a file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
      }
  
      // Determine the file type
      const fileType = req.file.mimetype;
  
      let extractedData = {};
  
      // Handle different file types
      if (fileType === 'application/pdf') {
        extractedData = await handlePdf(req.file.buffer);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 fileType === 'application/msword') {
        extractedData = await handleDocx(req.file.buffer);
      } else {
        return res.status(400).json({ message: 'Unsupported file type.' });
      }
  
      // Format the extracted data into the model format
      const formattedResume = formatResume(extractedData);
  
      // Save the formatted resume to a file in the uploads directory
      const formattedResumePath = path.join(__dirname, '../uploads', `formatted_resume_${Date.now()}.json`); // Use a timestamp for unique filenames
      fs.writeFileSync(formattedResumePath, JSON.stringify(formattedResume, null, 2)); // Save the file
  
      // Construct the URL for the saved file
      const resumeUrl = `/uploads/formatted_resume_${Date.now()}.json`; // Ensure this is correct relative to your server
  
      // Respond with success and the formatted resume URL
      res.status(200).json({
        message: 'Resume formatted successfully',
        resumeUrl: resumeUrl, // Include the URL in the response
      });
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

// Function to handle PDF extraction
async function handlePdf(buffer) {
  try {
    const data = await pdf(buffer);
    // Extract relevant data from data.text
    return parseResumeText(data.text);
  } catch (error) {
    console.error('Error extracting PDF:', error);
    throw error;
  }
}

// Function to handle DOCX extraction
async function handleDocx(buffer) {
  try {
    const { value: text } = await parseDocx(buffer);
    return parseResumeText(text);
  } catch (error) {
    console.error('Error extracting DOCX:', error);
    throw error;
  }
}

// Function to parse the extracted text
function parseResumeText(text) {
  const lines = text.split('\n');
  const extractedData = {
    name: '', 
    contact: '',
    summary: '',
    education: [],
    experience: [],
    skills: [],
  };

  // Add logic here to extract name, contact, etc., from lines
  // Example pseudo-logic
  extractedData.name = lines[0] || ''; // Assuming the first line is the name

  // Simple extraction logic (You need to customize this)
  lines.forEach(line => {
    if (line.includes('@')) {
      extractedData.contact = line; // Assuming line contains email
    }
    if (line.includes('Education')) {
      extractedData.education.push(line);
    }
    if (line.includes('Experience')) {
      extractedData.experience.push(line);
    }
    if (line.includes('Skills')) {
      extractedData.skills.push(line);
    }
  });

  return extractedData;
}

// Function to format extracted data into the model format
function formatResume(data) {
  const formatted = { ...modelResumeFormat };
  formatted.name = data.name;
  formatted.contact = data.contact;
  formatted.summary = data.summary;
  formatted.education = data.education;
  formatted.experience = data.experience;
  formatted.skills = data.skills;

  return formatted;
}

module.exports = router;
