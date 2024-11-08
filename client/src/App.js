import React, { useState } from "react";
import axios from "axios";

function App() {
  const [downloadLink, setDownloadLink] = useState(""); // For download link
  const [errorMessage, setErrorMessage] = useState(""); // For error messages

  const handleFileChange = (e) => {
    console.log(e.target.files[0].name); // Just for reference; you can remove this if not needed
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    const fileInput = event.target.elements.file;

    formData.append('file', fileInput.files[0]); // Append the file to form data

    try {
      const response = await axios.post('http://localhost:3001/api/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Formatted Resume:', response.data.resume);

      if (response.data.resumeUrl) {
        setDownloadLink(response.data.resumeUrl);
        setErrorMessage(''); // Clear any previous error messages
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('Error uploading file: ' + (error.response ? error.response.data.message : 'Unknown error'));
    }
  };

  return (
    <div>
      <h1>Resume Editor</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" name="file" onChange={handleFileChange} />
        <button type="submit">Upload and Format Resume</button>
      </form>
      {downloadLink && (
        <div>
          <h2>Your formatted resume is ready:</h2>
          <a href={downloadLink} download>Download JSON</a>
        </div>
      )}
      {errorMessage && <div style={{color: 'red'}}>{errorMessage}</div>} {/* Display error messages */}
    </div>
  );
}

export default App;
