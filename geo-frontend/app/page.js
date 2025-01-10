// app/page.js
"use client"
import { useState } from 'react';
import Map from './components/Map';
import FileUpload from './components/FileUpload';
import axios from 'axios';

const HomePage = () => {
  const [datasets, setDatasets] = useState([]);

  const handleFileUpload = (dataset) => {
    setDatasets((prevDatasets) => [...prevDatasets, dataset]);
  };

  return (
    <div>
      <h1>Geospatial Data Management</h1>
      <FileUpload onFileUploaded={handleFileUpload} />
      <Map datasets={datasets} onShapeDrawn={(shape) => console.log(shape)} />
    </div>
  );
};

export default HomePage;
