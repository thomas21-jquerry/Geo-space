"use client";
import { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ onFileUploaded }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // Get the JWT token from localStorage (or wherever it's stored)
    const token = localStorage.getItem('token');
    
    if (!token) {
      setMessage('You must be logged in to upload files');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,  // Include the JWT token in the header
        },
      });

      if (response.status === 200) {
        console.log(response.data, "from server");
        // Assuming the response contains the uploaded dataset (GeoJSON data)
        const dataset = {
          id: response.data.dataset.id,
          data: response.data.dataset.data, // or actual GeoJSON data depending on your API
        };
        onFileUploaded(dataset); // Pass the dataset to the parent component
        setMessage('File uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('Error uploading file');
    }
  };

  return (
    <div style={styles.fileUploadSection}>
      {/* Custom Choose File Button */}
      <label htmlFor="file-upload" style={styles.chooseFileButton}>Choose File</label>
      <input
        type="file"
        id="file-upload"
        onChange={handleFileChange}
        style={styles.fileInput}
        accept=".geojson,.json"
      />

      <button 
        onClick={handleUpload} 
        style={styles.fileUploadButton}
      >
        Upload File
      </button>
      
      {message && <p style={styles.message}>{message}</p>}
      
      {file && (
        <div style={styles.fileNameContainer}>
          <p style={styles.fileNameText}>Selected File: {file.name}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  fileUploadSection: {
    margin: '20px auto',
    padding: '25px',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '500px',
  },
  fileInput: {
    display: 'none', // Hide the default file input
  },
  chooseFileButton: {
    backgroundColor: '#28a745', // Green background for 'Choose File' button
    color: '#fff',
    padding: '12px 30px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '10px',
    display: 'inline-block',
  },
  fileUploadButton: {
    backgroundColor: '#007BFF',
    color: '#fff',
    padding: '12px 30px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '15px',
    width: '100%',
    maxWidth: '250px',
  },
  fileUploadButtonHover: {
    backgroundColor: '#0056b3',
    transform: 'scale(1.05)',
  },
  fileNameContainer: {
    marginTop: '15px',
    padding: '12px',
    border: '1px solid #007BFF',
    borderRadius: '8px',
    backgroundColor: '#f1f8ff',
    textAlign: 'center',
    fontSize: '14px',
    color: '#333',
    fontWeight: '500',
  },
  fileNameText: {
    fontSize: '16px',
    color: '#444',
    fontWeight: 'bold',
    wordWrap: 'break-word',
  },
  message: {
    marginTop: '15px',
    fontSize: '16px',
    color: '#ff5733', // Error message color
    fontWeight: '500',
  },
};

export default FileUpload;
