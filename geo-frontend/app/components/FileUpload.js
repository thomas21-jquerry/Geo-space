// app/components/FileUpload.js
"use client"
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

    try {
      const response = await axios.post('http://localhost:3001/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        console.log(response.data, "from server")
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
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
};

export default FileUpload;
